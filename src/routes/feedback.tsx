import { db } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { Headings } from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CircleCheck, Star, RefreshCw } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queuedOpenRouterRequest } from "@/lib/requestQueue";

const OPENROUTER_CONFIG = {
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  model: import.meta.env.VITE_OPENROUTER_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }
  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        if (interviewId) {
          try {
            const interviewDoc = await getDoc(
              doc(db, "interviews", interviewId)
            );
            if (interviewDoc.exists()) {
              setInterview({
                id: interviewDoc.id,
                ...interviewDoc.data(),
              } as Interview);
            }
          } catch (error) {
            console.log(error);
          }
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);

          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => {
            return { id: doc.id, ...doc.data() } as UserAnswer;
          });

          setFeedbacks(interviewData);
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);

  //   calculate the ratings out of 10

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";

    const totalRatings = feedbacks.reduce(
      (acc, feedback) => acc + feedback.rating,
      0
    );

    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  // Re-generate feedback for a specific answer
  const regenerateFeedback = async (feedbackId: string) => {
    const feedbackToRegenerate = feedbacks.find((f) => f.id === feedbackId);
    
    if (!feedbackToRegenerate) {
      toast.error("Error", { description: "Feedback not found" });
      return;
    }

    setRegeneratingId(feedbackId);
    
    toast.info("Processing", {
      description: "Request queued. Please wait...",
      duration: 3000,
    });

    try {
      // Call AI to re-evaluate
      const newEvaluation = await evaluateAnswer(
        feedbackToRegenerate.question,
        feedbackToRegenerate.correct_ans,
        feedbackToRegenerate.user_ans
      );

      // Update Firestore
      await updateDoc(doc(db, "userAnswers", feedbackId), {
        rating: newEvaluation.ratings,
        feedback: newEvaluation.feedback,
      });

      // Update local state
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, rating: newEvaluation.ratings, feedback: newEvaluation.feedback }
            : f
        )
      );

      toast.success("Success", {
        description: `Feedback regenerated! New rating: ${newEvaluation.ratings}/10`,
      });
    } catch (error) {
      console.error("Error regenerating feedback:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      if (errorMessage.includes("Rate limit")) {
        toast.error("Rate Limit Exceeded", {
          description: "Too many requests. Please wait 60 seconds before trying again.",
          duration: 5000,
        });
      } else {
        toast.error("Error", {
          description: "Failed to regenerate feedback. Please try again.",
        });
      }
    } finally {
      setRegeneratingId(null);
    }
  };

  // Evaluate answer using OpenRouter AI
  const evaluateAnswer = async (
    question: string,
    expectedAnswer: string,
    userAnswer: string,
    retryCount = 0
  ): Promise<AIResponse> => {
    if (!OPENROUTER_CONFIG.apiKey) {
      throw new Error("Missing OpenRouter API key");
    }

    const messages: OpenRouterMessage[] = [
      { 
        role: "system", 
        content: "You are an interview evaluator. Provide constructive feedback and ratings." 
      },
      {
        role: "user",
        content: `You are an interview evaluator. Compare the user's answer to the expected answer and provide feedback.

Question: "${question}"

Expected Answer: "${expectedAnswer}"

User's Answer: "${userAnswer}"

Evaluate the answer and respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "ratings": <number from 1 to 10>,
  "feedback": "<detailed constructive feedback string>"
}

Provide a rating from 1-10 based on:
- Accuracy and completeness
- Relevance to the question
- Clarity of explanation
- Use of specific examples

Your feedback should be constructive and help the candidate improve.`,
      },
    ];

    try {
      const data = await queuedOpenRouterRequest(
        `${OPENROUTER_CONFIG.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "AI Mock Interview",
          },
          body: JSON.stringify({
            model: OPENROUTER_CONFIG.model,
            messages,
            max_tokens: 2000,
            temperature: 0.7,
          }),
        },
        retryCount
      );
      const responseText = data.choices?.[0]?.message?.content ?? "";

      return cleanJsonResponse(responseText);
    } catch (error) {
      if (retryCount < 3 && error instanceof Error && error.message.includes("fetch")) {
        // Network error - retry
        const waitTime = 1000 * (retryCount + 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return evaluateAnswer(question, expectedAnswer, userAnswer, retryCount + 1);
      }
      throw error;
    }
  };

  // Clean and parse AI JSON response
  const cleanJsonResponse = (responseText: string): AIResponse => {
    try {
      let cleanText = responseText.trim();
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanText);
      
      if (typeof parsed.ratings === "number" && typeof parsed.feedback === "string") {
        return {
          ratings: parsed.ratings,
          feedback: parsed.feedback,
        };
      }
      
      throw new Error("Missing required fields in response");
    } catch (error) {
      console.error("JSON parsing error:", error);
      console.error("Raw response:", responseText);
      
      return {
        ratings: 5,
        feedback: "Your answer shows understanding of the topic. Focus on providing more specific examples and details to improve your response.",
      };
    }
  };

  if (isLoading) {
    return <LoaderPage className="w-full h-[70vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={"Feedback"}
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: `${interview?.position}`,
              link: `/generate/interview/${interview?.id}`,
            },
          ]}
        />
      </div>

      <Headings
        title="Congratulations !"
        description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
      />

      <p className="text-base text-muted-foreground">
        Your overall interview ratings :{" "}
        <span className="text-emerald-500 font-semibold text-xl">
          {overAllRating} / 10
        </span>
      </p>

      {interview && <InterviewPin interview={interview} onMockPage />}

      <Headings title="Interview Feedback" isSubHeading />

      {feedbacks && (
        <Accordion type="single" collapsible className="space-y-6">
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className="border rounded-lg shadow-md"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                  activeFeed === feed.id
                    ? "bg-gradient-to-r from-purple-50 to-blue-50"
                    : "hover:bg-gray-50"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold to-gray-700">
                    <Star className="inline mr-2 text-yellow-400" />
                    Rating : {feed.rating}
                  </div>
                  
                  <Button
                    onClick={() => regenerateFeedback(feed.id)}
                    disabled={regeneratingId === feed.id}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw 
                      className={cn(
                        "w-4 h-4",
                        regeneratingId === feed.id && "animate-spin"
                      )} 
                    />
                    {regeneratingId === feed.id ? "Regenerating..." : "Re-evaluate"}
                  </Button>
                </div>

                <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-green-600" />
                    Expected Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-yellow-600" />
                    Your Answer
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-red-600" />
                    Feedback
                  </CardTitle>

                  <CardDescription className="font-medium text-gray-700">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};
