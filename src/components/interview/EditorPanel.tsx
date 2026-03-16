"use client";

import { CodeEditor } from "@/components/editor/CodeEditor";
import { LanguageSelector } from "@/components/editor/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useInterviewStore } from "@/store/interviewStore";
import { RotateCcw } from "lucide-react";

export function EditorPanel() {
  const { currentProblem, language, setCode } = useInterviewStore();

  const resetToStarter = () => {
    if (!currentProblem?.codeSnippets) return;
    const snippet = currentProblem.codeSnippets.find((s) => s.langSlug === language);
    if (snippet) setCode(snippet.code);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b">
        <span className="text-sm font-medium text-muted-foreground">Code</span>
        <div className="flex-1" />
        <LanguageSelector />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={resetToStarter}
          title="Reset to starter code"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor />
      </div>
    </div>
  );
}
