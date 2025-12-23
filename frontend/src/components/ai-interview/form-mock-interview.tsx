import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Interview } from "@/types";

import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth as usePortalAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Headings } from "./headings";
import { Button } from "./ui/button";
import { Loader, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.number().min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
});

type FormData = z.infer<typeof formSchema>;

const OPENROUTER_CONFIG = {
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  model: import.meta.env.VITE_OPENROUTER_MODEL ?? "google/gemini-2.0-flash-exp:free",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
};

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const createOpenRouterChatSession = () => {
  const history: OpenRouterMessage[] = [
    { role: "system", content: "You are a helpful mock interview assistant." },
  ];

  return {
    async sendMessage(content: string) {
      history.push({ role: "user", content });

      const requestBody = {
        model: OPENROUTER_CONFIG.model,
        messages: history,
        max_tokens: 4000,
        temperature: 0.7,
      };

      console.log("Sending to OpenRouter:", requestBody);

      const response = await fetch(`${OPENROUTER_CONFIG.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_CONFIG.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "AI Mock Interview",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error("OpenRouter error details:", {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          model: OPENROUTER_CONFIG.model,
          apiKeyPresent: !!OPENROUTER_CONFIG.apiKey,
          requestBody,
        });
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

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: initialData?.position || "",
      description: initialData?.description || "",
      experience: initialData?.experience ?? 0,
      techStack: initialData?.techStack || "",
    },
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { activeUserId, loading: authLoading } = usePortalAuth();
  const chatSessionRef = useRef<ReturnType<typeof createOpenRouterChatSession> | null>(null);

  const title = initialData
    ? initialData.position
    : "Create a new mock interview";

  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully..." }
    : { title: "Created..!", description: "New Mock Interview created..." };

  const generateAiResponse = async (data: FormData) => {
    if (!OPENROUTER_CONFIG.apiKey) {
      throw new Error("Missing OpenRouter API key");
    }

    if (!chatSessionRef.current) {
      chatSessionRef.current = createOpenRouterChatSession();
    }

    const prompt = `As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

[
  { "question": "<Question text>", "answer": "<Answer text>" },
  ...
]

Job Information:
- Job Position: ${data.position}
- Job Description: ${data.description}
- Years of Experience Required: ${data.experience}
- Tech Stacks: ${data.techStack}

The questions should assess skills in ${data.techStack} development and best practices, problem-solving, and experience handling complex requirements. Please format the output strictly as an array of JSON objects without any additional labels, code blocks, or explanations. Return only the JSON array with questions and answers.`;

    const result = await chatSessionRef.current.sendMessage(prompt);

    // Clean and parse JSON response from AI with graceful fallbacks
    const cleanJsonResponse = (responseText: string) => {
      if (!responseText) {
        throw new Error("AI response was empty");
      }

      let cleanText = responseText.trim();
      cleanText = cleanText.replace(/```json|```/gi, "");

      const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        cleanText = arrayMatch[0];
      }

      const candidates: string[] = [cleanText];
      const trimmed = cleanText.trim().replace(/,+$/g, "");

      if (!trimmed.startsWith("[")) {
        candidates.push(`[${trimmed}`);
      }
      if (!trimmed.endsWith("]")) {
        candidates.push(`${trimmed}]`);
      }
      if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
        candidates.push(`[${trimmed}]`);
      }

      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed)) {
            return parsed;
          }
          if (parsed?.questions && Array.isArray(parsed.questions)) {
            return parsed.questions;
          }
        } catch (error) {
          continue;
        }
      }

      throw new Error("Unable to parse AI response");
    };

    return cleanJsonResponse(result.response.text());
  };

  const onSubmit = async (formData: FormData) => {
    if (authLoading) {
      toast.error("Hold on...", {
        description: "We are still finishing authentication. Please try again in a second.",
      });
      return;
    }

    if (!activeUserId) {
      console.error("Attempted to create/update interview without a userId");
      toast.error("You're signed out", {
        description: "Please sign in again before creating a mock interview.",
      });
      return;
    }

    try {
      console.log("Starting interview creation/update with data:", formData);
      setLoading(true);
      let targetInterviewId = initialData?.id;

      if (initialData) {
        // update
        if (isValid) {
          console.log("Updating existing interview:", initialData.id, "for userId:", activeUserId);
          const aiResult = await generateAiResponse(formData);
          console.log("AI generated questions:", aiResult);

          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...formData,
            updatedAt: serverTimestamp(),
          }).catch((error) => console.error("Update error:", error));
          toast(toastMessage.title, { description: toastMessage.description });
        }
      } else {
        // create a new mock interview
        if (isValid) {
          console.log("Creating new interview for userId:", activeUserId);
          const aiResult = await generateAiResponse(formData);
          console.log("AI generated questions:", aiResult);

          const docRef = await addDoc(collection(db, "interviews"), {
            ...formData,
            userId: activeUserId,
            questions: aiResult,
            createdAt: serverTimestamp(),
          }).catch((error) => {
            console.error("Firebase addDoc error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            throw error;
          });

          targetInterviewId = docRef.id;
          console.log("Successfully created interview with ID:", targetInterviewId);

          toast(toastMessage.title, { description: toastMessage.description });
        }
      }

      if (targetInterviewId) {
        console.log("Navigating to interview:", targetInterviewId);
        navigate(`/ai-interview/interview/${targetInterviewId}`, {
          replace: true,
        });
      } else {
        console.log("No interview ID, returning to dashboard");
        navigate("/ai-interview", { replace: true });
      }
    } catch (error) {
      console.error("Error during submit:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again later";
      toast.error("Error..", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
      });
    }
  }, [initialData, form]);

  return (
    <div className="min-h-screen w-full bg-gray-50 relative overflow-hidden text-gray-900">
      {/* Main Container */}
      <div className="relative z-10 max-w-5xl mx-auto p-6 flex-col space-y-6">
        <CustomBreadCrumb
          breadCrumbPage={breadCrumpPage}
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/ai-interview" },
          ]}
        />

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between w-full mb-6">
            <Headings title={title} isSubHeading />

            {initialData && (
              <Button size={"icon"} variant={"ghost"} className="hover:bg-red-50">
                <Trash2 className="min-w-4 min-h-4 text-red-500" />
              </Button>
            )}
          </div>

          <Separator className="my-6 bg-gray-200" />

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex-col flex items-start justify-start gap-6"
            >
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium">Job Role / Job Position</FormLabel>
                      <FormMessage className="text-sm text-red-500" />
                    </div>
                    <FormControl>
                      <Input
                        className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500"
                        disabled={loading}
                        placeholder="eg:- Full Stack Developer"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium">Job Description</FormLabel>
                      <FormMessage className="text-sm text-red-500" />
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[120px] bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        disabled={loading}
                        placeholder="eg:- describe your job role"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium">Years of Experience</FormLabel>
                      <FormMessage className="text-sm text-red-500" />
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500"
                        disabled={loading}
                        placeholder="eg:- 5 Years"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? undefined
                              : Number(event.target.value)
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="techStack"
                render={({ field }) => (
                  <FormItem className="w-full space-y-4">
                    <div className="w-full flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium">Tech Stacks</FormLabel>
                      <FormMessage className="text-sm text-red-500" />
                    </div>
                    <FormControl>
                      <Textarea
                        className="min-h-[80px] bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                        disabled={loading}
                        placeholder="eg:- React, TypeScript, Node.js..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="w-full flex items-center justify-end gap-4 mt-8">
                <Button
                  type="reset"
                  size={"sm"}
                  variant={"outline"}
                  disabled={isSubmitting || loading}
                  className="px-6 border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  size={"sm"}
                  disabled={isSubmitting || !isValid || loading}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 shadow-sm"
                >
                  {loading ? (
                    <Loader className="text-white animate-spin" />
                  ) : (
                    actions
                  )}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};
