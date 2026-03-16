"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { LanguageSelector } from "@/components/editor/LanguageSelector";
import { Button } from "@/components/ui/button";
import { useInterviewStore } from "@/store/interviewStore";
import { Loader2, Play, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RunOutput {
  stdout: string;
  stderr: string;
  exitCode: number;
  status?: string;
}

export function EditorPanel() {
  const { currentProblem, language, code, setCode } = useInterviewStore();
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<RunOutput | null>(null);

  const resetToStarter = () => {
    if (!currentProblem?.codeSnippets) return;
    const snippet = currentProblem.codeSnippets.find((s) => s.langSlug === language);
    if (snippet) setCode(snippet.code);
  };

  const runCode = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput({ stdout: "", stderr: data.error ?? "Unknown error", exitCode: 1 });
        return;
      }
      setOutput({
        stdout: data.stdout ?? "",
        stderr: data.stderr ?? "",
        exitCode: data.exitCode ?? 0,
        status: data.status,
      });
    } catch (e) {
      setOutput({ stdout: "", stderr: String(e), exitCode: 1 });
    } finally {
      setRunning(false);
    }
  };

  const hasOutput = output !== null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0">
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-green-400 hover:text-green-300 hover:bg-green-400/10"
          onClick={runCode}
          disabled={running}
          title="Run code"
        >
          {running ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-current" />
          )}
          Run
        </Button>
      </div>

      {/* Editor */}
      <div className={cn("min-h-0", hasOutput ? "flex-1" : "flex-1")}>
        <CodeEditor />
      </div>

      {/* Output pane */}
      {hasOutput && (
        <div className="shrink-0 border-t bg-black/40 flex flex-col" style={{ height: "180px" }}>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/10 shrink-0">
            <span className="text-xs font-medium text-muted-foreground">Output</span>
            {output.exitCode !== 0 && (
              <span className="text-xs text-red-400">{output.status ?? `exit ${output.exitCode}`}</span>
            )}
            <div className="flex-1" />
            <button
              onClick={() => setOutput(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="overflow-auto flex-1 p-3 font-mono text-xs leading-relaxed">
            {output.stdout && (
              <pre className="text-foreground whitespace-pre-wrap">{output.stdout}</pre>
            )}
            {output.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
            )}
            {!output.stdout && !output.stderr && (
              <span className="text-muted-foreground">(no output)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
