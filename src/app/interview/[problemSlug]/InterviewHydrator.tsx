"use client";

import { useEffect } from "react";
import { useInterviewStore } from "@/store/interviewStore";
import type { ProblemDetail } from "@/types/leetcode";

interface Props {
  problem: ProblemDetail;
}

export function InterviewHydrator({ problem }: Props) {
  const { setCurrentProblem, language, setCode, resetSession, code } =
    useInterviewStore();

  useEffect(() => {
    resetSession();
    setCurrentProblem(problem);

    // Set starter code for the current language
    const snippet = problem.codeSnippets?.find((s) => s.langSlug === language);
    if (snippet) setCode(snippet.code);
    else setCode("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem.titleSlug]);

  return null;
}
