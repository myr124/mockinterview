"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Topic {
  label: string;
  slug: string;
}

const TOPIC_GROUPS: { group: string; topics: Topic[] }[] = [
  {
    group: "Data Structures",
    topics: [
      { label: "Array",                slug: "array" },
      { label: "String",               slug: "string" },
      { label: "Hash Table",           slug: "hash-table" },
      { label: "Linked List",          slug: "linked-list" },
      { label: "Stack",                slug: "stack" },
      { label: "Queue",                slug: "queue" },
      { label: "Tree",                 slug: "tree" },
      { label: "Binary Search Tree",   slug: "binary-search-tree" },
      { label: "Graph",                slug: "graph" },
      { label: "Heap / Priority Queue",slug: "heap-priority-queue" },
      { label: "Trie",                 slug: "trie" },
      { label: "Matrix",               slug: "matrix" },
      { label: "Ordered Set",          slug: "ordered-set" },
    ],
  },
  {
    group: "Patterns",
    topics: [
      { label: "Two Pointers",         slug: "two-pointers" },
      { label: "Sliding Window",       slug: "sliding-window" },
      { label: "Binary Search",        slug: "binary-search" },
      { label: "Dynamic Programming",  slug: "dynamic-programming" },
      { label: "Backtracking",         slug: "backtracking" },
      { label: "Greedy",               slug: "greedy" },
      { label: "Depth-First Search",   slug: "depth-first-search" },
      { label: "Breadth-First Search", slug: "breadth-first-search" },
      { label: "Divide and Conquer",   slug: "divide-and-conquer" },
      { label: "Bit Manipulation",     slug: "bit-manipulation" },
      { label: "Math",                 slug: "math" },
      { label: "Sorting",              slug: "sorting" },
      { label: "Recursion",            slug: "recursion" },
    ],
  },
];

export { TOPIC_GROUPS };

interface TopicMultiSelectProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function TopicMultiSelect({ selected, onChange }: TopicMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const toggle = (slug: string) => {
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug]
    );
  };

  const allTopics = TOPIC_GROUPS.flatMap((g) => g.topics);
  const selectedTopics = allTopics.filter((t) => selected.includes(t.slug));

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="inline-flex items-center justify-between min-w-[160px] rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm hover:bg-white/10 transition-colors"
        >
          <span>
            {selected.length === 0
              ? "Topics & Patterns"
              : `${selected.length} selected`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2 shrink-0" />
        </PopoverTrigger>

        <PopoverContent className="w-64 p-0" align="start">
          <ScrollArea className="h-80">
            <div className="p-2">
              {TOPIC_GROUPS.map((group) => (
                <div key={group.group} className="mb-3">
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.group}
                  </p>
                  {group.topics.map((topic) => {
                    const isSelected = selected.includes(topic.slug);
                    return (
                      <button
                        key={topic.slug}
                        onClick={() => toggle(topic.slug)}
                        className={cn(
                          "flex items-center w-full gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                          isSelected
                            ? "bg-primary/15 text-primary"
                            : "hover:bg-accent text-foreground"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors",
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-muted-foreground/40"
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>

          {selected.length > 0 && (
            <div className="border-t p-2">
              <button
                onClick={() => onChange([])}
                className="text-xs text-muted-foreground hover:text-foreground w-full text-center py-1 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected chips */}
      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTopics.map((topic) => (
            <Badge
              key={topic.slug}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20 hover:text-destructive transition-colors"
              onClick={() => toggle(topic.slug)}
            >
              {topic.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
