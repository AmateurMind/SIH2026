/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page.tsx";
import { CustomBreadCrumb } from "@/components/ai-interview/custom-bread-crumb";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, WebcamIcon } from "lucide-react";
import { InterviewPin } from "@/components/ai-interview/pin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ai-interview/ui/alert";
import WebCam from "react-webcam";

export const MockLoadPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    const fetchInterview = async () => {
      if (interviewId) {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({
              id: interviewDoc.id,
              ...interviewDoc.data(),
            } as Interview);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  if (!interviewId) {
    navigate("/ai-interview", { replace: true });
  }

  if (!interview) {
    navigate("/ai-interview", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[68px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex items-center justify-between w-full gap-2">
          <CustomBreadCrumb
            breadCrumbPage={interview?.position || ""}
            breadCrumpItems={[
              { label: "Mock Interviews", link: "/ai-interview" },
            ]}
          />

          <Link to={`/ai-interview/start/${interviewId}`}>
            <Button size={"sm"} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200">
              Start <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {interview && <InterviewPin interview={interview} onMockPage />}

        <Alert className="bg-blue-50 border-blue-200 p-6 rounded-xl flex items-start gap-4 shadow-sm">
          <Lightbulb className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <AlertTitle className="text-blue-900 font-semibold text-lg">
              Important Information
            </AlertTitle>
            <AlertDescription className="text-blue-700 mt-2 leading-relaxed">
              Please enable your webcam and microphone to start the AI-generated
              mock interview. The interview consists of five questions. You’ll
              receive a personalized report based on your responses at the end.{" "}
              <br />
              <br />
              <span className="font-semibold text-blue-900">Note:</span> Your video is{" "}
              <strong className="text-blue-900">never recorded</strong>. You can disable your webcam at any
              time.
            </AlertDescription>
          </div>
        </Alert>

        <div className="flex flex-col items-center justify-center w-full gap-6">
          <div className="w-full h-[400px] md:w-[600px] flex flex-col items-center justify-center border border-blue-100 bg-white p-4 rounded-2xl shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            {isWebCamEnabled ? (
              <WebCam
                onUserMedia={() => setIsWebCamEnabled(true)}
                onUserMediaError={() => setIsWebCamEnabled(false)}
                className="w-full h-full object-cover rounded-xl border border-gray-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                  <WebcamIcon className="w-16 h-16 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium text-lg">Webcam is disabled</p>
              </div>
            )}
          </div>

          <Button
            onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}
            className={`
              px-8 py-6 text-base font-medium rounded-xl transition-all duration-200 shadow-sm
              ${isWebCamEnabled
                ? "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
              }
            `}
          >
            {isWebCamEnabled ? "Disable Webcam" : "Enable Webcam"}
          </Button>
        </div>
      </div>
    </div>
  );
};
