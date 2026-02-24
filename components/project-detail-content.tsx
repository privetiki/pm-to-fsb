"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useProgress } from "@/lib/progress-context";
import { useAuth } from "@/lib/auth-context";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  project: Project;
  prevProject: Project | null;
  nextProject: Project | null;
}

export function ProjectDetailContent({ project, prevProject, nextProject }: Props) {
  const { getStatus, startProject, completeProject, saveNotes, addArtifact, removeArtifact, progress } =
    useProgress();
  const { user } = useAuth();
  const status = user ? getStatus(project.id) : "locked";
  const userProgress = progress[project.id];
  const [notes, setNotes] = useState(userProgress?.notes || "");
  const [artifactUrl, setArtifactUrl] = useState("");

  function handleSaveNotes() {
    saveNotes(project.id, notes);
  }

  function handleAddArtifact() {
    if (artifactUrl.trim()) {
      addArtifact(project.id, artifactUrl.trim());
      setArtifactUrl("");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to board
      </Link>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Step {project.stepIndex} of {12}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px]",
              project.level === "Beginner" && "bg-chart-1/10 text-chart-1",
              project.level === "Intermediate" && "bg-chart-2/10 text-chart-2",
              project.level === "Advanced" && "bg-chart-3/10 text-chart-3"
            )}
          >
            {project.level}
          </Badge>
          {status === "completed" && (
            <Badge className="bg-foreground text-background text-[10px]">
              Completed
            </Badge>
          )}
          {status === "in_progress" && (
            <Badge className="bg-accent text-accent-foreground text-[10px]">
              In progress
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl text-balance">
          {project.title}
        </h1>
      </header>

      {/* Problem */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Problem
        </h2>
        <p className="text-sm leading-relaxed text-foreground">{project.problem}</p>
      </section>

      {/* Task */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Task
        </h2>
        <p className="text-sm leading-relaxed text-foreground">{project.task}</p>
      </section>

      {/* Skills + Tools */}
      <div className="flex flex-col gap-6 mb-6 md:flex-row">
        <section className="flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </section>
        <section className="flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Tools
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {project.tools.map((tool) => (
              <Badge key={tool} variant="outline" className="text-xs">
                {tool}
              </Badge>
            ))}
          </div>
        </section>
      </div>

      <Separator className="my-6" />

      {/* Deliverables */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Deliverables
        </h2>
        <ul className="flex flex-col gap-2">
          {project.deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              {d}
            </li>
          ))}
        </ul>
      </section>

      {/* Try it yourself */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Try it yourself
        </h2>
        <ol className="flex flex-col gap-2">
          {project.trySteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Resources */}
      {project.resources.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Resources
          </h2>
          <div className="flex flex-col gap-1">
            {project.resources.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-foreground underline underline-offset-4 hover:text-accent"
              >
                {r.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-6" />

      {/* Actions */}
      {user ? (
        <section className="mb-8 flex flex-col gap-4">
          {/* Start / Complete buttons */}
          <div className="flex flex-wrap gap-2">
            {status === "unlocked" && (
              <Button onClick={() => startProject(project.id)} className="gap-1.5">
                <Play className="h-4 w-4" />
                Start project
              </Button>
            )}
            {status === "in_progress" && (
              <Button onClick={() => completeProject(project.id)} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Mark as complete
              </Button>
            )}
            {status === "locked" && (
              <p className="text-sm text-muted-foreground">
                Complete the previous step to unlock this project.
              </p>
            )}
          </div>

          {/* Notes */}
          {(status === "in_progress" || status === "completed") && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Textarea
                  placeholder="Write your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
                <Button size="sm" variant="secondary" onClick={handleSaveNotes} className="self-end">
                  Save notes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Artifacts */}
          {(status === "in_progress" || status === "completed") && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Artifacts</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {userProgress?.artifacts && userProgress.artifacts.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {userProgress.artifacts.map((url, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground underline underline-offset-4 hover:text-accent truncate flex-1"
                        >
                          {url}
                        </a>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeArtifact(project.id, i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Remove artifact</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No artifacts yet.</p>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a link (e.g., GitHub repo)"
                    value={artifactUrl}
                    onChange={(e) => setArtifactUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddArtifact()}
                    className="text-sm"
                  />
                  <Button size="sm" variant="secondary" onClick={handleAddArtifact} className="shrink-0 gap-1">
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      ) : (
        <section className="mb-8">
          <Card className="border-border">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-accent">
                  Log in
                </Link>
                {" to track progress, take notes, and save artifacts."}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Previous / Next navigation */}
      <nav className="flex items-center justify-between pt-4 border-t border-border">
        {prevProject ? (
          <Link
            href={`/projects/${prevProject.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{prevProject.title}</span>
            <span className="sm:hidden">Previous</span>
          </Link>
        ) : (
          <div />
        )}
        {nextProject ? (
          <Link
            href={`/projects/${nextProject.id}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="hidden sm:inline">{nextProject.title}</span>
            <span className="sm:hidden">Next</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
