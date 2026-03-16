"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLeetCode } from "@/hooks/useLeetCode";
import { fetchProblems } from "@/lib/leetcode/client";
import { ProblemFilters } from "./ProblemFilters";
import { ProblemCard } from "./ProblemCard";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "use-debounce";
import type { Difficulty } from "@/types/leetcode";

const PAGE_SIZE = 50;

export function ProblemSelector() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [tags, setTags] = useState<string[]>([]);
  const [randomLoading, setRandomLoading] = useState(false);
  const [debouncedSearch] = useDebounce(search, 400);

  const { problems, total, loading, error, page, setPage } = useLeetCode({
    limit: PAGE_SIZE,
    difficulty,
    search: debouncedSearch,
    tags,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDifficultyChange = useCallback((v: Difficulty | "") => {
    setDifficulty(v);
  }, []);

  const handleRandom = useCallback(async () => {
    if (total === 0) return;
    setRandomLoading(true);
    try {
      // Pick a random offset within the filtered set, fetch just that one problem
      const randomSkip = Math.floor(Math.random() * total);
      const result = await fetchProblems({ skip: randomSkip, limit: 1, difficulty, tags });
      const pick = result.questions.find((q) => !q.isPaidOnly) ?? result.questions[0];
      if (pick) router.push(`/interview/${pick.titleSlug}`);
    } finally {
      setRandomLoading(false);
    }
  }, [total, difficulty, tags, router]);

  return (
    <div className="flex flex-col gap-4">
      <ProblemFilters
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        tags={tags}
        onTagsChange={setTags}
        onRandom={handleRandom}
        randomLoading={randomLoading}
      />

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <Loader2 className="animate-spin h-5 w-5" />
          <span>Loading problems...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive py-4">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="text-sm text-muted-foreground">
            {total} problems
          </div>
          <div className="flex flex-col gap-1.5">
            {problems.map((problem, i) => (
              <div
                key={problem.questionId}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <ProblemCard problem={problem} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
