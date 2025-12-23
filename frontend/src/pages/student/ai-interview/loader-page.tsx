import { Loader } from "lucide-react";

interface LoaderPageProps {
  className?: string;
}

export const LoaderPage = ({ className }: LoaderPageProps) => {
  return (
    <div className={`flex items-center justify-center bg-gray-50 ${className || "min-h-screen"}`}>
      <div className="text-center">
        <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};
