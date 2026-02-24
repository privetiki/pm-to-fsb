"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Target,
  Wrench,
  Lightbulb,
  ArrowRight,
  Clock,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useProgress } from "@/lib/progress-context";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    progress,
    activity,
    completedCount,
    uniqueTools,
    uniqueSkills,
    isLoading: progressLoading,
  } = useProgress();

  if (authLoading || progressLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Sign in to see your progress, stats, and activity.
        </p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    );
  }

  const pct = Math.round((completedCount / projects.length) * 100);

  const completedProjects = projects
    .filter((p) => progress[p.id]?.status === "completed")
    .sort((a, b) => {
      const aDate = progress[a.id]?.completedAt || "";
      const bDate = progress[b.id]?.completedAt || "";
      return bDate.localeCompare(aDate);
    });

  const problemsSolved = completedCount;

  // Skills coverage
  const allSkills = [...new Set(projects.flatMap((p) => p.skills))];
  const skillCoverage = allSkills.map((skill) => {
    const total = projects.filter((p) => p.skills.includes(skill)).length;
    const done = projects.filter(
      (p) => p.skills.includes(skill) && progress[p.id]?.status === "completed"
    ).length;
    return { skill, total, done, pct: Math.round((done / total) * 100) };
  });

  // Tools usage
  const allToolsList = projects.flatMap((p) =>
    progress[p.id]?.status === "completed" ? p.tools : []
  );
  const toolCounts: Record<string, number> = {};
  for (const t of allToolsList) {
    toolCounts[t] = (toolCounts[t] || 0) + 1;
  }
  const sortedTools = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
        Dashboard
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Welcome back, {user.name}.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8">
        <StatCard icon={CheckCircle2} label="Projects completed" value={completedCount} />
        <StatCard icon={Target} label="Problems solved" value={problemsSolved} />
        <StatCard icon={Wrench} label="Tools used" value={uniqueTools.length} />
        <StatCard icon={Lightbulb} label="Skills improved" value={uniqueSkills.length} />
      </div>

      {/* Overall progress */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">Board Progress</h2>
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Completion</span>
              <span className="text-xs font-medium text-foreground">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount} of {projects.length} projects completed
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Skills coverage */}
      {skillCoverage.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Skills Coverage</h2>
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-3">
                {skillCoverage
                  .sort((a, b) => b.pct - a.pct)
                  .slice(0, 10)
                  .map(({ skill, pct: skillPct }) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground">{skill}</span>
                        <span className="text-xs text-muted-foreground">{skillPct}%</span>
                      </div>
                      <Progress value={skillPct} className="h-1.5" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Tools usage */}
      {sortedTools.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">Tools Used</h2>
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-2">
                {sortedTools.map(([tool, count]) => (
                  <Badge key={tool} variant="secondary" className="text-xs gap-1">
                    {tool}
                    <span className="text-muted-foreground">({count})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <Separator className="my-8" />

      {/* Completed projects */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">Completed Projects</h2>
        {completedProjects.length > 0 ? (
          <div className="flex flex-col gap-2">
            {completedProjects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="hover:border-foreground/20 transition-colors">
                  <CardContent className="flex items-center gap-3 py-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.stepIndex}. {p.title}
                      </p>
                      {progress[p.id]?.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Completed{" "}
                          {formatDistanceToNow(new Date(progress[p.id].completedAt!), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No completed projects yet. Start your first project!
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3">
                <Link href="/">Go to board</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Activity timeline */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">Activity</h2>
        {activity.length > 0 ? (
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col gap-3">
                {activity.slice(0, 20).map((event, i) => {
                  const project = projects.find((p) => p.id === event.projectId);
                  if (!project) return null;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full shrink-0 mt-0.5",
                          event.type === "completed"
                            ? "bg-foreground text-background"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {event.type === "completed" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">
                            {event.type === "completed" ? "Completed" : "Started"}
                          </span>{" "}
                          <Link
                            href={`/projects/${project.id}`}
                            className="underline underline-offset-4 hover:text-accent"
                          >
                            {project.title}
                          </Link>
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
