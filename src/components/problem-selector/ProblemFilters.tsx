"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TopicMultiSelect } from "./TopicMultiSelect";
import { Shuffle } from "lucide-react";
import type { Difficulty } from "@/types/leetcode";

interface ProblemFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  difficulty: Difficulty | "";
  onDifficultyChange: (v: Difficulty | "") => void;
  tags: string[];
  onTagsChange: (v: string[]) => void;
  onRandom: () => void;
  randomLoading: boolean;
}

export function ProblemFilters({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  tags,
  onTagsChange,
  onRandom,
  randomLoading,
}: ProblemFiltersProps) {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex gap-3 flex-wrap items-center">
        <Input
          placeholder="Search problems..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={difficulty || "all"}
          onValueChange={(v) => onDifficultyChange(v === "all" ? "" : (v as Difficulty))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <TopicMultiSelect selected={tags} onChange={onTagsChange} />
        <Button
          variant="outline"
          size="default"
          onClick={onRandom}
          disabled={randomLoading}
          title="Pick a random problem"
          className="ml-auto"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Random
        </Button>
      </div>
    </div>
  );
}
