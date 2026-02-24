export type ProjectLevel = "Beginner" | "Intermediate" | "Advanced";

export type ProjectStatus = "locked" | "unlocked" | "in_progress" | "completed";

export interface Project {
  id: string;
  stepIndex: number;
  title: string;
  level: ProjectLevel;
  problem: string;
  task: string;
  tools: string[];
  skills: string[];
  deliverables: string[];
  trySteps: string[];
  resources: { label: string; url: string }[];
}

export interface UserProgress {
  [projectId: string]: {
    status: ProjectStatus;
    startedAt: string | null;
    completedAt: string | null;
    notes: string;
    artifacts: string[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ActivityEvent {
  projectId: string;
  type: "started" | "completed";
  timestamp: string;
}
