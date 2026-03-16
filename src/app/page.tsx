import { ProblemSelector } from "@/components/problem-selector/ProblemSelector";

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="orb-1 absolute top-[-15%] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/25 blur-[120px]" />
        <div className="orb-2 absolute top-[20%] right-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="orb-3 absolute bottom-[10%] left-[30%] w-[350px] h-[350px] rounded-full bg-indigo-500/20 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-bold tracking-tight">Mock Interview</h1>
          <p className="text-muted-foreground mt-1">
            Select a LeetCode problem to start an AI-powered voice interview session.
          </p>
        </div>
        <ProblemSelector />
      </div>
    </main>
  );
}
