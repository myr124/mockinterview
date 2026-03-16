"use client";

import dynamic from "next/dynamic";
import { useInterviewStore } from "@/store/interviewStore";
import { LANGUAGES } from "./LanguageSelector";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      <Loader2 className="animate-spin mr-2 h-4 w-4" />
      Loading editor...
    </div>
  ),
});

export function CodeEditor() {
  const { code, setCode, language } = useInterviewStore();

  const monacoLang =
    LANGUAGES.find((l) => l.value === language)?.monacoLang ?? "python";

  return (
    <MonacoEditor
      height="100%"
      language={monacoLang}
      value={code}
      onChange={(val) => setCode(val ?? "")}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: true,
      }}
    />
  );
}
