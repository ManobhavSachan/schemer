import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";
import { CollaboratorRole } from "@prisma/client";
import { getUser } from "../user/route";

export async function GET(request: NextRequest) {
  try {
    const { id: userId } = await getUser();
    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const dateOrder = (searchParams.get("dateOrder") || "desc") as
      | "asc"
      | "desc";
    const nameOrder = (searchParams.get("nameOrder") || "asc") as
      | "asc"
      | "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get user's projects with filters
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
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
      },
      orderBy: [{ title: nameOrder }, { createdAt: dateOrder }],
      skip,
      take: limit,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        collaborators: {
          select: {
            role: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const total = await prisma.project.count({
      where: {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
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
      },
    });

    return NextResponse.json({
      projects,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id: userId } = await getUser();

    const body = await request.json();
    console.log("Body", body);
    const { title, description, imageUrl } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create project and collaborator in a transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      console.log("Creating project", title, description, imageUrl, userId);
      const newProject = await tx.project.create({
        data: {
          title,
          description,
          imageUrl,
          userId,
        },
      });

      // Add user as admin collaborator
      await tx.collaborator.create({
        data: {
          userId,
          projectId: newProject.id,
          role: CollaboratorRole.admin,
        },
      });

      return newProject;
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
