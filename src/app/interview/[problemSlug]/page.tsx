import { fetchProblemDetail } from "@/lib/leetcode/client";
import { InterviewLayout } from "@/components/interview/InterviewLayout";
import { InterviewHydrator } from "./InterviewHydrator";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ problemSlug: string }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { problemSlug } = await params;

  let problem;
  try {
    problem = await fetchProblemDetail(problemSlug, true);
  } catch {
    notFound();
  }

  if (!problem) notFound();

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center gap-3 px-4 py-2 border-b shrink-0">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Problems
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate">
          {problem.questionId}. {problem.title}
        </span>
      </header>

      <div className="flex-1 min-h-0">
        <InterviewHydrator problem={problem} />
        <InterviewLayout />
      </div>
    </div>
  );
}
