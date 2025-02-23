"use client";

import { createContext, useContext } from "react";
import { useParams } from "next/navigation";

type ProjectContextType = {
  projectId: string;
};

const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined
);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const projectId = params.project_id as string;
  console.log(projectId);

  return (
    <ProjectContext.Provider value={{ projectId: projectId as string }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
