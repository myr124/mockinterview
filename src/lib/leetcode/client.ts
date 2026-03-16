import { PROBLEM_LIST_QUERY, PROBLEM_DETAIL_QUERY } from "./queries";
import type { ProblemSummary, ProblemDetail, Difficulty } from "@/types/leetcode";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql/";

async function leetcodeGQL<T>(
  query: string,
  variables: Record<string, unknown>,
  serverSide = false
): Promise<T> {
  const url = serverSide ? LEETCODE_GRAPHQL : "/api/leetcode";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(serverSide ? { Referer: "https://leetcode.com" } : {}),
    },
    body: JSON.stringify({ query, variables }),
    next: serverSide ? { revalidate: 3600 } : undefined,
  });
  if (!res.ok) throw new Error(`LeetCode API error: ${res.status}`);
  return res.json();
}

export interface FetchProblemsOptions {
  skip?: number;
  limit?: number;
  difficulty?: Difficulty | "";
  search?: string;
}

export async function fetchProblems(
  options: FetchProblemsOptions = {}
): Promise<{ total: number; questions: ProblemSummary[] }> {
  const { skip = 0, limit = 50, difficulty = "", search = "" } = options;

  const filters: Record<string, unknown> = {};
  if (difficulty) filters.difficulty = difficulty.toUpperCase();
  if (search) filters.searchKeywords = search;

  const data = await leetcodeGQL<{
    data: { problemsetQuestionList: { total: number; questions: ProblemSummary[] } };
  }>(PROBLEM_LIST_QUERY, {
    categorySlug: "",
    skip,
    limit,
    filters,
  });

  return data.data.problemsetQuestionList;
}

export async function fetchProblemDetail(
  titleSlug: string,
  serverSide = false
): Promise<ProblemDetail> {
  const data = await leetcodeGQL<{ data: { question: ProblemDetail } }>(
    PROBLEM_DETAIL_QUERY,
    { titleSlug },
    serverSide
  );
  return data.data.question;
}
