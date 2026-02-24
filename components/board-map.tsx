"use client";

import Link from "next/link";
import { Check, Lock, Play, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { projects } from "@/lib/data";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import type { ProjectStatus } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function NodeIcon({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "completed":
      return <Check className="h-4 w-4" />;
    case "in_progress":
      return <Play className="h-3.5 w-3.5" />;
    case "unlocked":
      return <Circle className="h-3.5 w-3.5" />;
    case "locked":
      return <Lock className="h-3.5 w-3.5" />;
  }
}

function getNodeClasses(status: ProjectStatus) {
  switch (status) {
    case "completed":
      return "bg-foreground text-background border-foreground";
    case "in_progress":
      return "bg-accent text-accent-foreground border-accent ring-2 ring-accent/30";
    case "unlocked":
      return "bg-background text-foreground border-foreground hover:bg-muted";
    case "locked":
      return "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50";
  }
}

export function BoardMap() {
  const { getStatus, isLoading } = useProgress();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-0 py-4">
      {projects.map((project, index) => {
        const status = user ? getStatus(project.id) : (index === 0 ? "unlocked" : "locked");
        const isClickable = status !== "locked";

        const node = (
          <div
            className={cn(
              "group relative flex items-center gap-4 rounded-lg border px-4 py-3 transition-all",
              status === "locked"
                ? "border-border bg-muted/50"
                : "border-border bg-card hover:border-foreground/20 hover:shadow-sm"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                getNodeClasses(status)
              )}
            >
              <NodeIcon status={status} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {project.stepIndex}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    project.level === "Beginner" && "bg-chart-1/10 text-chart-1",
                    project.level === "Intermediate" && "bg-chart-2/10 text-chart-2",
                    project.level === "Advanced" && "bg-chart-3/10 text-chart-3"
                  )}
                >
                  {project.level}
                </span>
              </div>
              <h3
                className={cn(
                  "text-sm font-medium truncate",
                  status === "locked" ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {project.title}
              </h3>
            </div>
            {status === "completed" && (
              <span className="text-xs font-medium text-muted-foreground">Done</span>
            )}
            {status === "in_progress" && (
              <span className="text-xs font-medium text-accent">In progress</span>
            )}
          </div>
        );

        return (
          <div key={project.id} className="relative">
            {/* Connector line */}
            {index < projects.length - 1 && (
              <div className="absolute left-[2.05rem] top-[3.25rem] h-[calc(100%-2rem)] w-px bg-border" />
            )}
            <div className="relative py-1.5">
              {isClickable ? (
                <Link href={`/projects/${project.id}`} className="block">
                  {node}
                </Link>
              ) : (
                node
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
