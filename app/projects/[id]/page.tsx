"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { getProjectById, projects } from "@/lib/data";
import { ProjectDetailContent } from "@/components/project-detail-content";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  const prevProject = projects.find((p) => p.stepIndex === project.stepIndex - 1) || null;
  const nextProject = projects.find((p) => p.stepIndex === project.stepIndex + 1) || null;

  return (
    <ProjectDetailContent
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}
