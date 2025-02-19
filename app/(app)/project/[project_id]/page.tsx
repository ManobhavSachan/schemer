"use client";

import { useParams } from "next/navigation";
import Canvas from "@/components/project/Canvas/Canvas";
import { ReactFlowProvider } from "@xyflow/react";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.project_id;

  // Now you have the project ID.  Use it to fetch data, etc.
  console.log(projectId);

  return (
    <div className="flex h-full w-full">
      <ReactFlowProvider>
        <Canvas />
      </ReactFlowProvider>
    </div>
  );
}
