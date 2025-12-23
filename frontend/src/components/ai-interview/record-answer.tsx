/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth as usePortalAuth } from "@/context/AuthContext";
import {
  StopCircle,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

const OPENROUTER_CONFIG = {
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  model: import.meta.env.VITE_OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const createOpenRouterChatSession = () => {
  const history: OpenRouterMessage[] = [
    { role: "system", content: "You are a helpful assistant that evaluates interview answers and provides constructive feedback." },
  ];

  return {
    async sendMessage(content: string) {
      history.push({ role: "user", content });

      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "AI Mock Interview",
        },
        body: JSON.stringify({
          model: OPENROUTER_CONFIG.model,
          messages: history,
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenRouter request failed: ${response.status} ${errorBody}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content ?? "";
      history.push({ role: "assistant", content: assistantMessage });

      return {
        response: {
          text: () => assistantMessage,
        },
      };
    },
  };
};

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatSessionRef = useRef<ReturnType<typeof createOpenRouterChatSession> | null>(null);

  const { activeUserId: userId } = usePortalAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.length < 30) {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });

        return;
      }

      //   ai result
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      setAiResult(aiResult);
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);

    if (!OPENROUTER_CONFIG.apiKey) {
      throw new Error("Missing OpenRouter API key");
    }

    if (!chatSessionRef.current) {
      chatSessionRef.current = createOpenRouterChatSession();
    }

    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer.
      GRADING INSTRUCTIONS:
      1. Be LENIENT and GENEROUS with the rating (from 1 to 10).
      2. If the user mentions key concepts or keywords related to the answer, award a high score (7-10), even if the grammar is imperfect.
      3. Focus on the user's understanding of the core concept.
      4. Provide specific but encouraging feedback for improvement.
      
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await chatSessionRef.current.sendMessage(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(
        aiResult.response.text()
      );
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        // save the user answer

        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          userId,
          createdAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(!open);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combineTranscripts);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border border-blue-100 p-4 bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-slate-300" />
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <TooltipButton
          content={isWebCam ? "Turn Off" : "Turn On"}
          buttonVariant="outline"
          buttonClassName={isWebCam ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"}
          icon={
            isWebCam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebCam(!isWebCam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          buttonVariant="outline"
          buttonClassName={isRecording ? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 animate-pulse" : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"}
          icon={
            isRecording ? (
              <StopCircle className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          buttonVariant="outline"
          buttonClassName="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          buttonVariant="outline"
          buttonClassName="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disbaled={!aiResult}
        />
      </div>

      <div className="w-full mt-4 p-6 border border-blue-100 rounded-xl bg-white shadow-md">
        <h2 className="text-lg font-semibold text-blue-900">Your Answer:</h2>

        <p className="text-sm mt-3 text-slate-700 whitespace-normal leading-relaxed">
          {userAnswer || "Start recording to see your answer here"}
        </p>

        {interimResult && (
          <p className="text-sm text-slate-500 mt-3 bg-slate-50 p-2 rounded border border-slate-100">
            <strong className="text-slate-700">Current Speech:</strong>{" "}
            {interimResult}
          </p>
        )}
      </div>
    </div>
  );
};
