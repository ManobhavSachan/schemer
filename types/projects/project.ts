import { CollaboratorRole } from '@prisma/client'

export interface Project {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
  user?: {
    firstName: string
    lastName: string | null
  }
  collaborators?: {
    role: CollaboratorRole
    user: {
      firstName: string
      lastName: string | null
    }
  }[]
}

export interface ProjectsResponse {
  projects: Project[]
  pagination: {
    total: number
    pages: number
    page: number
    limit: number
  }
}

export interface CreateProjectRequest {
  title: string;
  description: string | null;
  imageUrl: string | null;
}
