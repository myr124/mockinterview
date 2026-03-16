"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { ProblemSummary } from "@/types/leetcode";
import { cn } from "@/lib/utils";

const DIFFICULTY_COLOR = {
  Easy: "text-green-600",
  Medium: "text-yellow-600",
  Hard: "text-red-600",
} as const;

interface ProblemCardProps {
  problem: ProblemSummary;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  if (problem.isPaidOnly) {
    return (
      <Card className="opacity-50 cursor-not-allowed bg-white/5 backdrop-blur-md border border-white/10">
        <CardContent className="py-3 px-4 flex items-center gap-3">
          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm text-muted-foreground flex-1 truncate">
            {problem.questionId}. {problem.title}
          </span>
          <span className={cn("text-xs font-medium shrink-0", DIFFICULTY_COLOR[problem.difficulty])}>
            {problem.difficulty}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/interview/${problem.titleSlug}`}>
      <Card className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
        <CardContent className="py-3 px-4 flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-10 shrink-0">
            {problem.questionId}.
          </span>
          <span className="text-sm font-medium flex-1 truncate">{problem.title}</span>
          <div className="flex items-center gap-2 shrink-0">
            {problem.topicTags.slice(0, 2).map((tag) => (
              <Badge key={tag.slug} variant="outline" className="text-xs hidden sm:inline-flex">
                {tag.name}
              </Badge>
            ))}
            <span
              className={cn(
                "text-xs font-medium min-w-[50px] text-right",
                DIFFICULTY_COLOR[problem.difficulty]
              )}
            >
              {problem.difficulty}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
