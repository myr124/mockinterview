"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ProblemPanel } from "./ProblemPanel";
import { EditorPanel } from "./EditorPanel";
import { VoicePanel } from "./VoicePanel";

export function InterviewLayout() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={30} minSize={20} className="min-w-0">
        <ProblemPanel />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={45} minSize={25} className="min-w-0">
        <EditorPanel />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={25} minSize={18} className="min-w-0">
        <VoicePanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
