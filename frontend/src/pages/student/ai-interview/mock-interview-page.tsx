/* eslint-disable @typescript-eslint/no-unused-vars */
import { Interview } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderPage } from "./loader-page.tsx";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { CustomBreadCrumb } from "@/components/ai-interview/custom-bread-crumb";

import { Alert, AlertDescription, AlertTitle } from "@/components/ai-interview/ui/alert";
import { Lightbulb } from "lucide-react";
import { QuestionSection } from "@/components/ai-interview/question-section";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!interviewId) {
      navigate("/ai-interview", { replace: true });
      return;
    }

    setIsLoading(true);
    const fetchInterview = async () => {
      try {
        const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
        if (interviewDoc.exists()) {
          setInterview({
            id: interviewDoc.id,
            ...interviewDoc.data(),
          } as Interview);
        } else {
          navigate("/ai-interview", { replace: true });
        }
      } catch (error) {
        console.log(error);
        navigate("/ai-interview", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterview();
  }, [interviewId, navigate]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-[68px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <CustomBreadCrumb
          breadCrumbPage="Start"
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/ai-interview" },
            {
              label: interview?.position || "",
              link: `/ai-interview/interview/${interview?.id}`,
            },
          ]}
        />

        <div className="w-full">
          <Alert className="bg-sky-50 border border-sky-200 p-4 rounded-xl flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-sky-600" />
            <div>
              <AlertTitle className="text-sky-800 font-semibold">
                Important Note
              </AlertTitle>
              <AlertDescription className="text-sm text-sky-700 mt-1 leading-relaxed">
                Press "Record Answer" to begin answering the question. Once you
                finish the interview, you&apos;ll receive feedback comparing your
                responses with the ideal answers.
                <br />
                <br />
                <strong className="text-sky-800">Note:</strong>{" "}
                <span className="font-medium text-sky-800">Your video is never recorded.</span>{" "}
                You can disable the webcam anytime if preferred.
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {interview?.questions && interview?.questions.length > 0 && (
          <div className="mt-4 w-full flex flex-col items-start gap-4">
            <QuestionSection questions={interview?.questions} />
          </div>
        )}
      </div>
    </div>
  );
};
