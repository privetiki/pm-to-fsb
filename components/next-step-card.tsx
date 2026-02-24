"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import { projects } from "@/lib/data";

export function NextStepCard() {
  const { nextUnlockedProject, completedCount, getStatus } = useProgress();
  const { user } = useAuth();

  if (!user) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to track your progress and continue your journey.
          </p>
          <Button asChild size="sm">
            <Link href="/login">Log in to start</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (completedCount === projects.length) {
    return (
      <Card className="border-foreground/20 bg-card">
        <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
          <h3 className="text-lg font-semibold text-foreground">Journey Complete</h3>
          <p className="text-sm text-muted-foreground">
            {"You've completed all 12 projects. You're a Full Stack Builder!"}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-2">
            <Link href="/dashboard">View dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!nextUnlockedProject) return null;

  const status = getStatus(nextUnlockedProject.id);

  return (
    <Card className="border-border bg-card">
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-muted-foreground">
                Next: Step {nextUnlockedProject.stepIndex}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {nextUnlockedProject.level}
              </Badge>
              {status === "in_progress" && (
                <span className="text-[10px] font-medium text-accent">In progress</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {nextUnlockedProject.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {nextUnlockedProject.problem}
            </p>
          </div>
          <Button asChild size="sm" className="shrink-0 gap-1">
            <Link href={`/projects/${nextUnlockedProject.id}`}>
              {status === "in_progress" ? "Continue" : "Start"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
