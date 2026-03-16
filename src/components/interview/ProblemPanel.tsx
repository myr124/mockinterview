"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLOR = {
  Easy: "bg-green-500/20 text-green-600 border-green-500/30",
  Medium: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  Hard: "bg-red-500/20 text-red-600 border-red-500/30",
} as const;

export function ProblemPanel() {
  const { currentProblem } = useInterviewStore();

  if (!currentProblem) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No problem loaded.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <div className="flex items-start gap-2 flex-wrap">
          <h2 className="text-base font-semibold flex-1">
            {currentProblem.questionId}. {currentProblem.title}
          </h2>
          <Badge
            variant="outline"
            className={cn("shrink-0", DIFFICULTY_COLOR[currentProblem.difficulty])}
          >
            {currentProblem.difficulty}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {currentProblem.topicTags.map((tag) => (
            <Badge key={tag.slug} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: currentProblem.content }}
        />

        {currentProblem.hints && currentProblem.hints.length > 0 && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Hints ({currentProblem.hints.length})
            </summary>
            <ul className="mt-2 space-y-2">
              {currentProblem.hints.map((hint, i) => (
                <li key={i} className="text-sm text-muted-foreground pl-4 border-l-2">
                  {hint}
                </li>
              ))}
            </ul>
          </details>
        )}
      </ScrollArea>
    </div>
  );
}
