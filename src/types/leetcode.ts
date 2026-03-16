export type Difficulty = "Easy" | "Medium" | "Hard";

export interface TopicTag {
  name: string;
  slug: string;
}

export interface CodeSnippet {
  lang: string;
  langSlug: string;
  code: string;
}

export interface ProblemSummary {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: Difficulty;
  topicTags: TopicTag[];
  isPaidOnly: boolean;
}

export interface ProblemDetail extends ProblemSummary {
  content: string; // HTML
  hints: string[];
  codeSnippets: CodeSnippet[];
  exampleTestcaseList?: string[];
}

export interface ProblemListResponse {
  data: {
    problemsetQuestionList: {
      total: number;
      questions: ProblemSummary[];
    };
  };
}

export interface ProblemDetailResponse {
  data: {
    question: ProblemDetail;
  };
}
