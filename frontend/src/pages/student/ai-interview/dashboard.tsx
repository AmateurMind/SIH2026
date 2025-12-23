import { Headings } from "@/components/ai-interview/headings";
import { InterviewPin } from "@/components/ai-interview/pin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ai-interview/ui/separator";
import { Skeleton } from "@/components/ai-interview/ui/skeleton";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth as usePortalAuth } from "@/context/AuthContext";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { Plus, Trophy, Target, Zap, Clock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { activeUserId, loading: authLoading } = usePortalAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!activeUserId) {
      setInterviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const interviewQuery = query(
      collection(db, "interviews"),
      where("userId", "==", activeUserId)
    );

    const unsubscribeInterviews = onSnapshot(
      interviewQuery,
      (snapshot) => {
        const interviewList: Interview[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Interview[];
        // Sort by createdAt desc in memory just in case, though query should handle it
        interviewList.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
        setInterviews(interviewList);
        setLoading(false);
      },
      (error) => {
        console.error("Error on fetching interviews:", error);
        toast.error("Error", {
          description: "Something went wrong. Try again later.",
        });
        setLoading(false);
      }
    );

    // Fetch User Answers for Stats
    const answersQuery = query(
      collection(db, "userAnswers"),
      where("userId", "==", activeUserId)
    );

    const unsubscribeAnswers = onSnapshot(answersQuery, (snapshot) => {
      const answersList = snapshot.docs.map((doc) => doc.data());

      if (answersList.length > 0) {
        const totalRating = answersList.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const avg = totalRating / answersList.length;
        // Convert 1-10 rating to percentage
        const percentage = Math.round((avg / 10) * 100);
        setStats(prev => ({ ...prev, avgPerformance: percentage }));
      } else {
        setStats(prev => ({ ...prev, avgPerformance: 0 }));
      }
    });

    return () => {
      unsubscribeInterviews();
      unsubscribeAnswers();
    };
  }, [activeUserId, authLoading]);

  const [stats, setStats] = useState({ avgPerformance: 0 });

  const handleDelete = async (interviewId: string) => {
    if (!activeUserId) return;

    if (!window.confirm("Delete this mock interview? This also removes any saved answers.")) {
      return;
    }

    setDeletingId(interviewId);
    try {
      await deleteDoc(doc(db, "interviews", interviewId));
      const answersSnap = await getDocs(
        query(
          collection(db, "userAnswers"),
          where("mockIdRef", "==", interviewId),
          where("userId", "==", activeUserId)
        )
      );
      if (!answersSnap.empty) {
        const batch = writeBatch(db);
        answersSnap.forEach((answerDoc) => batch.delete(answerDoc.ref));
        await batch.commit();
      }
      toast.success("Interview deleted");
    } catch (error) {
      console.error("Error deleting interview", error);
      toast.error("Couldn't delete interview");
    } finally {
      setDeletingId(null);
    }
  };

  // Stats Logic (Mock+Real mix)
  const totalInterviews = interviews.length;
  // Placeholder for average score - in a real app this would come from the interviews data
  const averageScore = interviews.length > 0 ? "85%" : "N/A";
  const completedSessions = interviews.filter(i => false).length; // Placeholder logic if 'completed' status exists

  return (
    <div className="min-h-screen w-full bg-gray-50/50 relative overflow-hidden text-gray-900 font-sans">

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen">

        {/* Header / Hero */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Interview Dashboard
            </h1>
            <p className="text-gray-500 mt-1 text-base">
              Track your progress and practice with AI-driven mock interviews.
            </p>
          </div>
          <Link to="/ai-interview/create">
            <Button size={"lg"} className="bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all hover:scale-105 active:scale-95">
              <Plus className="mr-2 h-5 w-5" /> Start New Interview
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Interviews</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalInterviews}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Performance</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgPerformance > 0 ? `${stats.avgPerformance}%` : "N/A"}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Latest Activity</p>
              <h3 className="text-sm font-semibold text-gray-900 mt-1">
                {interviews.length > 0 && interviews[0]?.createdAt
                  ? new Date(interviews[0].createdAt.seconds * 1000).toLocaleDateString()
                  : "No activity"}
              </h3>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-200" />

        {/* Recent Interviews Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              Recent Interviews
            </h2>
            {interviews.length > 0 && (
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                {interviews.length} sessions
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : interviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
              {interviews.map((interview) => (
                <InterviewPin
                  key={interview.id}
                  interview={interview}
                  onDelete={handleDelete}
                  isDeleting={deletingId === interview.id}
                />
              ))}
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center min-h-[400px] bg-white border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
              <div className="bg-blue-50 p-6 rounded-full mb-6 animate-bounce">
                <Sparkles className="w-12 h-12 text-blue-500" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                Ready to practice?
              </h2>

              <p className="max-w-md text-gray-500 mt-3 mb-8 text-lg">
                Create your first AI mock interview to start tracking your progress and improving your skills.
              </p>

              <Link to="/ai-interview/create">
                <Button size={"lg"} className="bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200/50">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Interview
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
