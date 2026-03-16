"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchProblems } from "@/lib/leetcode/client";
import type { ProblemSummary, Difficulty } from "@/types/leetcode";

interface UseLeetCodeOptions {
  limit?: number;
  difficulty?: Difficulty | "";
  search?: string;
}

interface UseLeetCodeResult {
  problems: ProblemSummary[];
  total: number;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: (p: number) => void;
  refetch: () => void;
}

export function useLeetCode(options: UseLeetCodeOptions = {}): UseLeetCodeResult {
  const { limit = 50, difficulty = "", search = "" } = options;
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProblems({
        skip: page * limit,
        limit,
        difficulty,
        search,
      });
      setProblems(result.questions);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  }, [page, limit, difficulty, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [difficulty, search]);

  return { problems, total, loading, error, page, setPage, refetch: fetch };
}
