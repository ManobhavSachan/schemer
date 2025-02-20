import { useMutation, useQuery } from "@tanstack/react-query";
import { CreateProjectRequest, Project, ProjectsResponse } from "@/types/projects/project";

const createProject = async ({
  title,
  description,
  imageUrl,
}: CreateProjectRequest) => {
  const response = await fetch("/api/project", {
    method: "POST",
    body: JSON.stringify({ title, description, imageUrl }),
  });
  return response.json();
};

export const useCreateProject = (
  onSuccess: (project: Project) => void,
  onError: () => void
) => {
  return useMutation({
    mutationFn: (project: CreateProjectRequest) => createProject(project),
    onSuccess: (project: Project) => onSuccess(project),
    onError: () => onError(),
  });
};

const getProjects = async (): Promise<ProjectsResponse> => {
  const response = await fetch("/api/project");
  return response.json();
};

export const useGetProjects = (enabled: boolean) => {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
    enabled: enabled,
  });
};
