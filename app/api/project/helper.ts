import { Prisma } from "@prisma/client";

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateProjectInput = (input: {
  title: string;
  description?: string;
  imageUrl?: string;
}) => {
  if (!input.title || input.title.length > 255) {
    throw new Error("Title must be between 1 and 255 characters");
  }
  if (input.description && input.description.length > 1000) {
    throw new Error("Description must not exceed 1000 characters");
  }
  if (input.imageUrl && !isValidUrl(input.imageUrl)) {
    throw new Error("Invalid image URL format");
  }
};

export function getProjectFilters(search: string, userId: string) {
  return {
    OR: [
      {
        title: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive" as Prisma.QueryMode,
        },
      },
    ],
    AND: [
      {
        OR: [
          { userId },
          {
            collaborators: {
              some: {
                userId,
              },
            },
          },
        ],
      },
    ],
  };
}
