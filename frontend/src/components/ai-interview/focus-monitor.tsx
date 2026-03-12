import { useEffect, useRef, useState } from "react";

interface FocusEvent {
  type: string;
  timestamp: string;
  severity: "info" | "warn" | "danger";
}

interface FocusMonitorProps {
  onSuspicionUpdate?: (score: number, log: FocusEvent[]) => void;
}

const THRESHOLDS = {
  yawAngle: 20,        // degrees left/right before flagging
  pitchAngle: 15,      // degrees up/down before flagging
  irisDeviation: 0.28,
  headAwayMs: 10000,
  irisAwayMs: 5000,
  lookingDownMs: 8000,
  noFaceMs: 3000,
};

const SCORE_PENALTIES = {
  headAway: 10,
  irisAway: 7,
  lookingDown: 8,
  noFace: 15,
  tabSwitch: 20,
  multipleFaces: 25,
};

// 6 key landmarks used for head pose estimation
// nose tip, chin, left eye corner, right eye corner, left mouth, right mouth
const POSE_LANDMARK_IDS = [1, 152, 33, 263, 61, 291];

const estimateHeadPose = (landmarks: any[]) => {
  // 3D model points of a generic face (normalized)
  const modelPoints = [
    [0.0, 0.0, 0.0],        // nose tip
    [0.0, -330.0, -65.0],   // chin
    [-225.0, 170.0, -135.0],// left eye corner
    [225.0, 170.0, -135.0], // right eye corner
    [-150.0, -150.0, -125.0],// left mouth
    [150.0, -150.0, -125.0], // right mouth
  ];

  // get the 6 landmarks from mediapipe (normalized 0-1, convert to pixels)
  const w = 320, h = 240;
  const imagePoints = POSE_LANDMARK_IDS.map((id) => [
    landmarks[id].x * w,
    landmarks[id].y * h,
  ]);

  // simplified yaw: angle between eye corners vs horizontal
  const leftEye = imagePoints[2];
  const rightEye = imagePoints[3];
  const noseTip = imagePoints[0];
  const chin = imagePoints[1];

  // yaw — how much nose deviates horizontally from eye midpoint
  const eyeMidX = (leftEye[0] + rightEye[0]) / 2;
  const eyeWidth = rightEye[0] - leftEye[0];
  const noseOffset = noseTip[0] - eyeMidX;
  const yaw = (noseOffset / (eyeWidth / 2)) * 30; // scale to degrees approx

  // pitch — how much nose deviates vertically from eye-chin midpoint
  const eyeMidY = (leftEye[1] + rightEye[1]) / 2;
  const faceHeight = chin[1] - eyeMidY;
  const nosePitchOffset = noseTip[1] - (eyeMidY + faceHeight * 0.35);
  const pitch = (nosePitchOffset / (faceHeight * 0.3)) * 15;

  return { yaw, pitch };
};

export const FocusMonitor = ({ onSuspicionUpdate }: FocusMonitorProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const faceMeshRef = useRef<any>(null);

  const headAwayTimer = useRef<number | null>(null);
  const irisAwayTimer = useRef<number | null>(null);
  const lookingDownTimer = useRef<number | null>(null);
  const noFaceTimer = useRef<number | null>(null);
  const decayTimer = useRef<number | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [suspicionScore, setSuspicionScore] = useState(0);
  const [eventLog, setEventLog] = useState<FocusEvent[]>([]);
  const [headPose, setHeadPose] = useState({ yaw: 0, pitch: 0 });

  const [signals, setSignals] = useState({
    headCentered: true,
    eyesOnScreen: true,
    tabActive: true,
    faceVisible: true,
    singleFace: true,
  });

  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const scoreRef = useRef(0);
  const logRef = useRef<FocusEvent[]>([]);

  const addEvent = (type: string, severity: FocusEvent["severity"]) => {
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const entry: FocusEvent = { type, timestamp, severity };
    logRef.current = [entry, ...logRef.current].slice(0, 10);
    setEventLog([...logRef.current]);
  };

  const applyPenalty = (points: number) => {
    scoreRef.current = Math.min(100, scoreRef.current + points);
    setSuspicionScore(scoreRef.current);
    onSuspicionUpdate?.(scoreRef.current, logRef.current);
  };

  // score decay
  useEffect(() => {
    decayTimer.current = window.setInterval(() => {
      if (scoreRef.current > 0) {
        scoreRef.current = Math.max(0, scoreRef.current - 1);
        setSuspicionScore(scoreRef.current);
      }
    }, 10000);
    return () => clearInterval(decayTimer.current!);
  }, []);

  // tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent("Tab switched away", "danger");
        applyPenalty(SCORE_PENALTIES.tabSwitch);
        setSignals((s) => ({ ...s, tabActive: false }));
        setActiveAlert("Tab switch detected!");
      } else {
        setSignals((s) => ({ ...s, tabActive: true }));
        setActiveAlert(null);
        addEvent("Returned to tab", "info");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // mediapipe setup
  useEffect(() => {
    let cancelled = false;

    const loadMediaPipe = async () => {
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        const { Camera } = await import("@mediapipe/camera_utils");

        if (cancelled || !videoRef.current) return;

        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 2,        // detect up to 2 faces
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (cancelled) return;

          const faceCount = results.multiFaceLandmarks?.length ?? 0;
          const hasface = faceCount > 0;
          setFaceDetected(hasface);

          // draw canvas overlay
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

              if (hasface) {
                const landmarks = results.multiFaceLandmarks[0];

                // draw nose tip
                const nose = landmarks[1];
                ctx.beginPath();
                ctx.arc(
                  nose.x * canvasRef.current.width,
                  nose.y * canvasRef.current.height,
                  4, 0, 2 * Math.PI
                );
                ctx.fillStyle = "#3b82f6";
                ctx.fill();

                // draw iris dots
                [468, 473].forEach((idx) => {
                  if (landmarks[idx]) {
                    const pt = landmarks[idx];
                    ctx.beginPath();
                    ctx.arc(
                      pt.x * canvasRef.current!.width,
                      pt.y * canvasRef.current!.height,
                      3, 0, 2 * Math.PI
                    );
                    ctx.fillStyle = "#10b981";
                    ctx.fill();
                  }
                });

                // draw pose landmark dots
                POSE_LANDMARK_IDS.forEach((id) => {
                  const pt = landmarks[id];
                  ctx.beginPath();
                  ctx.arc(
                    pt.x * canvasRef.current!.width,
                    pt.y * canvasRef.current!.height,
                    2, 0, 2 * Math.PI
                  );
                  ctx.fillStyle = "#f59e0b";
                  ctx.fill();
                });

                // draw second face box if detected
                if (faceCount > 1) {
                  const face2 = results.multiFaceLandmarks[1];
                  const xs = face2.map((l: any) => l.x * canvasRef.current!.width);
                  const ys = face2.map((l: any) => l.y * canvasRef.current!.height);
                  const minX = Math.min(...xs), maxX = Math.max(...xs);
                  const minY = Math.min(...ys), maxY = Math.max(...ys);
                  ctx.strokeStyle = "#ef4444";
                  ctx.lineWidth = 2;
                  ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
                  ctx.fillStyle = "#ef4444";
                  ctx.font = "10px sans-serif";
                  ctx.fillText("2nd face!", minX, minY - 4);
                }
              }
            }
          }

          // ── multiple face detection ──
          if (faceCount > 1) {
            setSignals((s) => ({ ...s, singleFace: false }));
            addEvent("Multiple faces detected!", "danger");
            applyPenalty(SCORE_PENALTIES.multipleFaces);
            setActiveAlert("Multiple faces detected!");
          } else {
            setSignals((s) => ({ ...s, singleFace: true }));
          }

          // ── no face ──
          if (!hasface) {
            setSignals((s) => ({ ...s, faceVisible: false }));
            if (!noFaceTimer.current) {
              noFaceTimer.current = window.setTimeout(() => {
                addEvent("Face not visible", "danger");
                applyPenalty(SCORE_PENALTIES.noFace);
                setActiveAlert("Face not detected!");
              }, THRESHOLDS.noFaceMs);
            }
            return;
          }

          if (noFaceTimer.current) {
            clearTimeout(noFaceTimer.current);
            noFaceTimer.current = null;
          }
          setSignals((s) => ({ ...s, faceVisible: true }));

          const landmarks = results.multiFaceLandmarks[0];

          // ── head pose (3D angle) ──
          const { yaw, pitch } = estimateHeadPose(landmarks);
          setHeadPose({ yaw: Math.round(yaw), pitch: Math.round(pitch) });

          const headOff =
            Math.abs(yaw) > THRESHOLDS.yawAngle ||
            Math.abs(pitch) > THRESHOLDS.pitchAngle;

          if (headOff) {
            setSignals((s) => ({ ...s, headCentered: false }));
            if (!headAwayTimer.current) {
              headAwayTimer.current = window.setTimeout(() => {
                addEvent(
                  `Head turned (yaw:${Math.round(yaw)}° pitch:${Math.round(pitch)}°)`,
                  "warn"
                );
                applyPenalty(SCORE_PENALTIES.headAway);
                setActiveAlert("Keep your head centered!");
                headAwayTimer.current = null;
              }, THRESHOLDS.headAwayMs);
            }
          } else {
            if (headAwayTimer.current) {
              clearTimeout(headAwayTimer.current);
              headAwayTimer.current = null;
            }
            setSignals((s) => ({ ...s, headCentered: true }));
            if (activeAlert === "Keep your head centered!") setActiveAlert(null);
          }

          // ── iris / gaze tracking ──
          if (landmarks[468] && landmarks[473]) {
            const leftIris = landmarks[468];
            const rightIris = landmarks[473];
            const leftCornerL = landmarks[33];
            const leftCornerR = landmarks[133];
            const rightCornerL = landmarks[362];
            const rightCornerR = landmarks[263];

            const leftEyeWidth = leftCornerR.x - leftCornerL.x;
            const rightEyeWidth = rightCornerR.x - rightCornerL.x;

            const leftIrisPos =
              leftEyeWidth > 0
                ? (leftIris.x - leftCornerL.x) / leftEyeWidth
                : 0.5;
            const rightIrisPos =
              rightEyeWidth > 0
                ? (rightIris.x - rightCornerL.x) / rightEyeWidth
                : 0.5;

            const avgIrisPos = (leftIrisPos + rightIrisPos) / 2;
            const irisOff =
              avgIrisPos < THRESHOLDS.irisDeviation ||
              avgIrisPos > 1 - THRESHOLDS.irisDeviation;

            if (irisOff) {
              setSignals((s) => ({ ...s, eyesOnScreen: false }));
              if (!irisAwayTimer.current) {
                irisAwayTimer.current = window.setTimeout(() => {
                  addEvent("Eyes looking away", "warn");
                  applyPenalty(SCORE_PENALTIES.irisAway);
                  setActiveAlert("Keep your eyes on the screen!");
                  irisAwayTimer.current = null;
                }, THRESHOLDS.irisAwayMs);
              }
            } else {
              if (irisAwayTimer.current) {
                clearTimeout(irisAwayTimer.current);
                irisAwayTimer.current = null;
              }
              setSignals((s) => ({ ...s, eyesOnScreen: true }));
            }
          }
        });

        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await faceMesh.send({ image: videoRef.current });
            }
          },
          width: 320,
          height: 240,
        });

        faceMeshRef.current = faceMesh;
        cameraRef.current = camera;
        await camera.start();
        if (!cancelled) setIsLoaded(true);
        addEvent("Monitor started", "info");
      } catch (err) {
        console.error("FocusMonitor failed to load:", err);
      }
    };

    loadMediaPipe();

    return () => {
      cancelled = true;
      cameraRef.current?.stop();
      clearTimeout(headAwayTimer.current!);
      clearTimeout(irisAwayTimer.current!);
      clearTimeout(lookingDownTimer.current!);
      clearTimeout(noFaceTimer.current!);
      clearInterval(decayTimer.current!);
    };
  }, []);

  const scoreColor =
    suspicionScore <= 30
      ? "text-emerald-600"
      : suspicionScore <= 60
      ? "text-amber-500"
      : "text-red-500";

  const scoreBarColor =
    suspicionScore <= 30
      ? "bg-emerald-500"
      : suspicionScore <= 60
      ? "bg-amber-400"
      : "bg-red-500";

  const alertBgColor = activeAlert
    ? "bg-red-50 border-red-200 text-red-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return (
    <div className="w-56 flex flex-col gap-3 shrink-0">
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Focus Monitor
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isLoaded ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
          }`}>
            {isLoaded ? "Live" : "Loading..."}
          </span>
        </div>

        <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden mb-3">
          <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute top-1.5 right-1.5">
            <div className={`w-2 h-2 rounded-full ${faceDetected ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
          </div>
          <span className="absolute bottom-1 left-2 text-[10px] text-slate-400">
            {faceDetected ? "face detected" : "no face"}
          </span>
        </div>

        {/* head pose readout */}
        <div className="flex justify-between mb-3 bg-slate-50 rounded-lg px-2 py-1.5">
          <span className="text-[10px] text-slate-400">
            Yaw <span className={`font-semibold ${Math.abs(headPose.yaw) > THRESHOLDS.yawAngle ? "text-red-500" : "text-slate-600"}`}>
              {headPose.yaw}°
            </span>
          </span>
          <span className="text-[10px] text-slate-400">
            Pitch <span className={`font-semibold ${Math.abs(headPose.pitch) > THRESHOLDS.pitchAngle ? "text-red-500" : "text-slate-600"}`}>
              {headPose.pitch}°
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">Focus score</span>
          <span className={`text-sm font-semibold ${scoreColor}`}>
            {Math.max(0, 100 - suspicionScore)}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${scoreBarColor}`}
            style={{ width: `${Math.max(0, 100 - suspicionScore)}%` }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          {[
            { label: "Head centered", ok: signals.headCentered },
            { label: "Eyes on screen", ok: signals.eyesOnScreen },
            { label: "Tab active", ok: signals.tabActive },
            { label: "Face visible", ok: signals.faceVisible },
            { label: "Single face", ok: signals.singleFace },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Event log
        </p>
        <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto">
          {eventLog.length === 0 ? (
            <p className="text-xs text-slate-400">No events yet</p>
          ) : (
            eventLog.map((e, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-[10px] text-slate-400 min-w-[28px] pt-px tabular-nums">
                  {e.timestamp}
                </span>
                <span className={`text-xs ${
                  e.severity === "danger" ? "text-red-500"
                  : e.severity === "warn" ? "text-amber-500"
                  : "text-slate-500"
                }`}>
                  {e.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`border rounded-lg px-3 py-2 ${alertBgColor}`}>
        <p className="text-xs font-medium">
          {activeAlert ?? "All good — stay focused!"}
        </p>
      </div>
    </div>
  );
};
