"use client";

import { useParams } from "next/navigation";
import Canvas from "@/components/project/Canvas/Canvas";

export default function ProjectPage() {

  const params = useParams();
  const projectId = params.project_id;

  // Now you have the project ID.  Use it to fetch data, etc.
  console.log(projectId);

  return (
    <div>
        <h1>Project Details</h1>
        <p>Project ID: {projectId}</p>
        <Canvas />
    </div>
  );
}
