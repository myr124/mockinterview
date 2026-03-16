"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInterviewStore } from "@/store/interviewStore";
import type { Language } from "@/types/interview";

const LANGUAGES: { value: Language; label: string; monacoLang: string }[] = [
  { value: "python3", label: "Python 3", monacoLang: "python" },
  { value: "javascript", label: "JavaScript", monacoLang: "javascript" },
  { value: "typescript", label: "TypeScript", monacoLang: "typescript" },
  { value: "java", label: "Java", monacoLang: "java" },
  { value: "cpp", label: "C++", monacoLang: "cpp" },
  { value: "go", label: "Go", monacoLang: "go" },
  { value: "rust", label: "Rust", monacoLang: "rust" },
];

export { LANGUAGES };

export function LanguageSelector() {
  const { language, setLanguage, currentProblem, setCode } = useInterviewStore();

  const handleChange = (value: Language | null) => {
    if (!value) return;
    setLanguage(value);
    // Auto-populate starter code if available
    if (currentProblem?.codeSnippets) {
      const snippet = currentProblem.codeSnippets.find(
        (s) => s.langSlug === value
      );
      if (snippet) setCode(snippet.code);
    }
  };

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className="w-36 h-8 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.value} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
