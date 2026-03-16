"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInterviewStore } from "@/store/interviewStore";
import { cn } from "@/lib/utils";

export function TranscriptView() {
  const { turns } = useInterviewStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  if (turns.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Transcript will appear here when the session starts.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full px-3 py-2">
      <div className="space-y-3">
        {turns.map((turn) => (
          <div
            key={turn.id}
            className={cn(
              "flex flex-col gap-1",
              turn.role === "user" ? "items-end" : "items-start"
            )}
          >
            <span className="text-xs text-muted-foreground">
              {turn.role === "user" ? "You" : "Interviewer"}
            </span>
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                turn.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              )}
            >
              {turn.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
