import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";
import { CollaboratorRole } from "@prisma/client";
import { getUser } from "../user/helper";
import DOMPurify from "isomorphic-dompurify";
import { validateProjectInput, getProjectFilters } from "./helper";

export async function GET(request: NextRequest) {
  try {
    const { id: userId } = await getUser();
    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const validOrders = ["asc", "desc"] as const;
    type OrderType = (typeof validOrders)[number];

    const validateOrder = (
      order: string | null,
      defaultOrder: OrderType
    ): OrderType =>
      order && validOrders.includes(order as OrderType)
        ? (order as OrderType)
        : defaultOrder;

    const dateOrder = validateOrder(searchParams.get("dateOrder"), "desc");
    const nameOrder = validateOrder(searchParams.get("nameOrder"), "asc");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    // Get user's projects with filters
    const projects = await prisma.project.findMany({
      where: getProjectFilters(search, userId),
      orderBy: [{ createdAt: dateOrder }, { title: nameOrder }],
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
      where: getProjectFilters(search, userId),
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
    const { title, description, imageUrl } = body;
    validateProjectInput({ title, description, imageUrl });

    const sanitizedInput = {
      title: DOMPurify.sanitize(title),
      description: description ? DOMPurify.sanitize(description) : undefined,
      imageUrl: imageUrl ? DOMPurify.sanitize(imageUrl) : undefined,
    };

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Create project and collaborator in a transaction
    const project = await prisma.$transaction(async (tx) => {
      // Create the project
      console.log("Creating project", title, description, imageUrl, userId);
      const newProject = await tx.project.create({
        data: {
          title: sanitizedInput.title,
          description: sanitizedInput.description,
          imageUrl: sanitizedInput.imageUrl,
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
