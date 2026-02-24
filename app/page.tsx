"use client";

import { Progress } from "@/components/ui/progress";
import { BoardMap } from "@/components/board-map";
import { NextStepCard } from "@/components/next-step-card";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { projects } from "@/lib/data";

export default function HomePage() {
  const { completedCount } = useProgress();
  const { user } = useAuth();
  const pct = Math.round((completedCount / projects.length) * 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
          From Product Manager to Full Stack Builder
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-lg">
          A step-by-step journey through 12 projects. Complete each one to unlock
          the next and build real skills along the way.
        </p>
      </section>

      {/* Progress bar */}
      {user && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Progress
            </span>
            <span className="text-xs font-medium text-foreground">
              {completedCount}/{projects.length} completed
            </span>
          </div>
          <Progress value={pct} className="h-2" />
        </section>
      )}

      {/* Next step CTA */}
      <section className="mb-8">
        <NextStepCard />
      </section>

      {/* Board map */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          The Board
        </h2>
        <BoardMap />
      </section>
    </div>
  );
}
