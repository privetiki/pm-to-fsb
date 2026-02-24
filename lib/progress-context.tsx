"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserProgress, ProjectStatus, ActivityEvent } from "./types";
import { projects } from "./data";
import { useAuth } from "./auth-context";
import { createClient } from "./supabase";

interface ProgressContextType {
  progress: UserProgress;
  activity: ActivityEvent[];
  getStatus: (projectId: string) => ProjectStatus;
  startProject: (projectId: string) => void;
  completeProject: (projectId: string) => void;
  saveNotes: (projectId: string, notes: string) => void;
  addArtifact: (projectId: string, url: string) => void;
  removeArtifact: (projectId: string, index: number) => void;
  isLoading: boolean;
  completedCount: number;
  uniqueTools: string[];
  uniqueSkills: string[];
  nextUnlockedProject: typeof projects[number] | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress>({});
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user) {
        if (!isMounted) return;
        setProgress({});
        setActivity([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const [progressRes, artifactsRes, activityRes] = await Promise.all([
          supabase
            .from("user_progress")
            .select("project_id,status,started_at,completed_at,notes")
            .eq("user_id", user.id),
          supabase
            .from("user_artifacts")
            .select("project_id,url,created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("activity_events")
            .select("project_id,type,timestamp")
            .eq("user_id", user.id)
            .order("timestamp", { ascending: false }),
        ]);

        if (!isMounted) return;

        const progressMap: UserProgress = {};

        if (progressRes.data) {
          for (const row of progressRes.data as any[]) {
            const projectId = row.project_id as string;
            progressMap[projectId] = {
              status: row.status as ProjectStatus,
              startedAt: (row.started_at as string | null) ?? null,
              completedAt: (row.completed_at as string | null) ?? null,
              notes: (row.notes as string | null) ?? "",
              artifacts: [],
            };
          }
        }

        if (artifactsRes.data) {
          for (const row of artifactsRes.data as any[]) {
            const projectId = row.project_id as string;
            if (!progressMap[projectId]) {
              progressMap[projectId] = {
                status: "unlocked",
                startedAt: null,
                completedAt: null,
                notes: "",
                artifacts: [],
              };
            }
            progressMap[projectId].artifacts.push(row.url as string);
          }
        }

        const activityEvents: ActivityEvent[] =
          (activityRes.data as any[])?.map((row) => ({
            projectId: row.project_id as string,
            type: row.type as ActivityEvent["type"],
            timestamp: row.timestamp as string,
          })) ?? [];

        setProgress(progressMap);
        setActivity(activityEvents);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, supabase]);

  const getStatus = useCallback(
    (projectId: string): ProjectStatus => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return "locked";

      const entry = progress[projectId];
      if (entry?.status === "completed") return "completed";
      if (entry?.status === "in_progress") return "in_progress";

      // First project is always unlocked
      if (project.stepIndex === 1) return "unlocked";

      // Unlock if previous step is completed
      const prev = projects.find((p) => p.stepIndex === project.stepIndex - 1);
      if (prev && progress[prev.id]?.status === "completed") return "unlocked";

      return "locked";
    },
    [progress]
  );

  const startProject = useCallback(
    (projectId: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      const updated = {
        ...progress,
        [projectId]: {
          ...progress[projectId],
          status: "in_progress" as const,
          startedAt: now,
          completedAt: progress[projectId]?.completedAt || null,
          notes: progress[projectId]?.notes || "",
          artifacts: progress[projectId]?.artifacts || [],
        },
      };
      const newEvent: ActivityEvent = { projectId, type: "started", timestamp: now };
      const updatedActivity = [newEvent, ...activity];
      setProgress(updated);
      setActivity(updatedActivity);
      void (async () => {
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          project_id: projectId,
          status: "in_progress",
          started_at: now,
          completed_at: progress[projectId]?.completedAt ?? null,
          notes: progress[projectId]?.notes ?? "",
        });
        await supabase.from("activity_events").insert({
          user_id: user.id,
          project_id: projectId,
          type: "started",
          timestamp: now,
        });
      })();
    },
    [user, progress, activity, supabase]
  );

  const completeProject = useCallback(
    (projectId: string) => {
      if (!user) return;
      const now = new Date().toISOString();
      const updated = {
        ...progress,
        [projectId]: {
          ...progress[projectId],
          status: "completed" as const,
          startedAt: progress[projectId]?.startedAt || now,
          completedAt: now,
          notes: progress[projectId]?.notes || "",
          artifacts: progress[projectId]?.artifacts || [],
        },
      };
      const newEvent: ActivityEvent = { projectId, type: "completed", timestamp: now };
      const updatedActivity = [newEvent, ...activity];
      setProgress(updated);
      setActivity(updatedActivity);
      void (async () => {
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          project_id: projectId,
          status: "completed",
          started_at: progress[projectId]?.startedAt ?? now,
          completed_at: now,
          notes: progress[projectId]?.notes ?? "",
        });
        await supabase.from("activity_events").insert({
          user_id: user.id,
          project_id: projectId,
          type: "completed",
          timestamp: now,
        });
      })();
    },
    [user, progress, activity, supabase]
  );

  const saveNotes = useCallback(
    (projectId: string, notes: string) => {
      if (!user) return;
      const updated = {
        ...progress,
        [projectId]: {
          ...progress[projectId],
          status: progress[projectId]?.status || ("unlocked" as const),
          startedAt: progress[projectId]?.startedAt || null,
          completedAt: progress[projectId]?.completedAt || null,
          notes,
          artifacts: progress[projectId]?.artifacts || [],
        },
      };
      setProgress(updated);
      void (async () => {
        const entry = updated[projectId];
        await supabase.from("user_progress").upsert({
          user_id: user.id,
          project_id: projectId,
          status: entry.status,
          started_at: entry.startedAt,
          completed_at: entry.completedAt,
          notes: entry.notes,
        });
      })();
    },
    [user, progress, supabase]
  );

  const addArtifact = useCallback(
    (projectId: string, url: string) => {
      if (!user) return;
      const existing = progress[projectId]?.artifacts || [];
      const updated = {
        ...progress,
        [projectId]: {
          ...progress[projectId],
          status: progress[projectId]?.status || ("unlocked" as const),
          startedAt: progress[projectId]?.startedAt || null,
          completedAt: progress[projectId]?.completedAt || null,
          notes: progress[projectId]?.notes || "",
          artifacts: [...existing, url],
        },
      };
      setProgress(updated);
      void (async () => {
        await supabase.from("user_artifacts").insert({
          user_id: user.id,
          project_id: projectId,
          url,
        });
      })();
    },
    [user, progress, supabase]
  );

  const removeArtifact = useCallback(
    (projectId: string, index: number) => {
      if (!user) return;
      const existing = progress[projectId]?.artifacts || [];
      const url = existing[index];
      if (!url) return;
      const updated = {
        ...progress,
        [projectId]: {
          ...progress[projectId],
          status: progress[projectId]?.status || ("unlocked" as const),
          startedAt: progress[projectId]?.startedAt || null,
          completedAt: progress[projectId]?.completedAt || null,
          notes: progress[projectId]?.notes || "",
          artifacts: existing.filter((_, i) => i !== index),
        },
      };
      setProgress(updated);
      void (async () => {
        await supabase
          .from("user_artifacts")
          .delete()
          .eq("user_id", user.id)
          .eq("project_id", projectId)
          .eq("url", url);
      })();
    },
    [user, progress, supabase]
  );

  const completedCount = Object.values(progress).filter(
    (p) => p.status === "completed"
  ).length;

  const uniqueTools = [
    ...new Set(
      projects
        .filter((p) => progress[p.id]?.status === "completed")
        .flatMap((p) => p.tools)
    ),
  ];

  const uniqueSkills = [
    ...new Set(
      projects
        .filter((p) => progress[p.id]?.status === "completed")
        .flatMap((p) => p.skills)
    ),
  ];

  const nextUnlockedProject =
    projects.find((p) => {
      const s = getStatus(p.id);
      return s === "unlocked" || s === "in_progress";
    }) || null;

  return (
    <ProgressContext.Provider
      value={{
        progress,
        activity,
        getStatus,
        startProject,
        completeProject,
        saveNotes,
        addArtifact,
        removeArtifact,
        isLoading,
        completedCount,
        uniqueTools,
        uniqueSkills,
        nextUnlockedProject,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
