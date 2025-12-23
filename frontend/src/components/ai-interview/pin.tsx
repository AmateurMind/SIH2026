import { Interview } from "@/types";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { TooltipButton } from "./tooltip-button";
import { Eye, Newspaper, Sparkles, Trash2 } from "lucide-react";

interface InterviewPinProps {
  interview: Interview;
  onMockPage?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export const InterviewPin = ({
  interview,
  onMockPage = false,
  onDelete,
  isDeleting = false,
}: InterviewPinProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-white p-5 rounded-xl cursor-pointer transition-all space-y-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 group">
      <CardTitle className="text-lg text-gray-900 font-semibold">{interview?.position}</CardTitle>
      <CardDescription className="text-gray-500 text-sm line-clamp-2">{interview?.description}</CardDescription>
      <div className="w-full flex items-center gap-2 flex-wrap">
        {interview?.techStack.split(",").map((word, index) => (
          <Badge
            key={index}
            variant={"outline"}
            className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors"
          >
            {word.trim()}
          </Badge>
        ))}
      </div>

      <CardFooter
        className={cn(
          "w-full flex items-center p-0",
          onMockPage ? "justify-end" : "justify-between"
        )}
      >
        <p className="text-[11px] text-gray-400 truncate whitespace-nowrap">
          {`${new Date(interview?.createdAt.toDate()).toLocaleDateString(
            "en-US",
            { dateStyle: "long" }
          )} - ${new Date(interview?.createdAt.toDate()).toLocaleTimeString(
            "en-US",
            { timeStyle: "short" }
          )}`}
        </p>

        {!onMockPage && (
          <div className="flex items-center justify-center">
            <TooltipButton
              content="View"
              buttonVariant={"ghost"}
              onClick={() => {
                navigate(`/ai-interview/interview/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="hover:text-blue-600 text-gray-400 hover:bg-blue-50"
              icon={<Eye />}
              loading={false}
            />

            <TooltipButton
              content="Feedback"
              buttonVariant={"ghost"}
              onClick={() => {
                navigate(`/ai-interview/feedback/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="hover:text-yellow-600 text-gray-400 hover:bg-yellow-50"
              icon={<Newspaper />}
              loading={false}
            />

            <TooltipButton
              content="Start"
              buttonVariant={"ghost"}
              onClick={() => {
                navigate(`/ai-interview/start/${interview?.id}`, {
                  replace: true,
                });
              }}
              disbaled={false}
              buttonClassName="hover:text-emerald-600 text-gray-400 hover:bg-emerald-50"
              icon={<Sparkles />}
              loading={false}
            />

            {onDelete && (
              <TooltipButton
                content="Delete"
                buttonVariant={"ghost"}
                onClick={() => onDelete(interview.id)}
                disbaled={isDeleting}
                buttonClassName="hover:text-red-600 text-gray-400 hover:bg-red-50"
                icon={<Trash2 />}
                loading={isDeleting}
              />
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
