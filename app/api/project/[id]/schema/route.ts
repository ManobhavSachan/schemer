import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismaClient";
import { getUser } from "@/app/api/user/helper";
import { CollaboratorRole, RelationshipType } from "@prisma/client";
import { checkProjectAccess } from "@/app/api/project/helper";


// PUT endpoint to save schema
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await params following Next.js 15 guidelines
    const { id: projectId } = await params;
    const { id: userId } = await getUser();
    // Check if user has access to the project
    const collaborator = await checkProjectAccess(projectId, userId);

    // Only admin and editor roles can update schema
    if (
      collaborator.role !== CollaboratorRole.admin &&
      collaborator.role !== CollaboratorRole.editor
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { nodes, edges } = body;

    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json(
        { error: "Invalid schema data: nodes are required" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Delete existing tables, columns, and relationships for this project
      await tx.relationship.deleteMany({
        where: {
          sourceTable: {
            projectId,
          },
        },
      });

      await tx.tableColumn.deleteMany({
        where: {
          projectTable: {
            projectId,
          },
        },
      });

      await tx.projectTable.deleteMany({
        where: {
          projectId,
        },
      });

      // Create tables and columns
      const tableIdMap = new Map(); // Map to store node.id -> database table id
      const columnIdMap = new Map(); // Map to store node.id + column.title -> database column id

      // Create tables first
      for (const node of nodes) {
        const table = await tx.projectTable.create({
          data: {
            name: node.data.label,
            projectId,
          },
        });

        tableIdMap.set(node.id, table.id);

        // Create columns for this table
        for (const column of node.data.schema) {
          const tableColumn = await tx.tableColumn.create({
            data: {
              name: column.title,
              dataType: column.type,
              isNullable: !column.isNotNull,
              defaultValue: column.defaultValue || null,
              tableId: table.id,
            },
          });

          columnIdMap.set(`${node.id}-${column.title}`, tableColumn.id);
        }
      }

      // Create relationships
      if (edges && Array.isArray(edges)) {
        for (const edge of edges) {
          const sourceTableId = tableIdMap.get(edge.source);
          const targetTableId = tableIdMap.get(edge.target);
          
          if (!sourceTableId || !targetTableId) {
            console.warn(`Skipping edge ${edge.id}: table not found`);
            continue;
          }

          const sourceColumnId = columnIdMap.get(`${edge.source}-${edge.sourceHandle}`);
          const targetColumnId = columnIdMap.get(`${edge.target}-${edge.targetHandle}`);

          if (!sourceColumnId || !targetColumnId) {
            console.warn(`Skipping edge ${edge.id}: column not found`);
            continue;
          }

          // Default to one-to-many relationship
          await tx.relationship.create({
            data: {
              sourceTableId,
              targetTableId,
              sourceColumnId,
              targetColumnId,
              relationshipType: RelationshipType.one_to_many,
            },
          });
        }
      }

      // TODO: Handle enums when database schema supports them
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving schema:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve schema
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Properly await params following Next.js 15 guidelines
    const { id: projectId } = await params;
    const { id: userId } = await getUser();

    // Check if user has access to the project
    await checkProjectAccess(projectId, userId);

    // Fetch tables, columns, and relationships
    const tables = await prisma.projectTable.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        tableColumns: true,
        sourceRelationships: {
          include: {
            sourceColumn: true,
            targetColumn: true,
            targetTable: true,
          },
        },
        targetRelationships: {
          include: {
            sourceColumn: true,
            targetColumn: true,
            sourceTable: true,
          },
        },
      },
    });

    // If no tables found, return empty arrays
    if (!tables || tables.length === 0) {
      return NextResponse.json({ nodes: [], edges: [] });
    }

    // Transform data to match the expected format for the frontend
    const nodes = tables.map((table) => ({
      id: table.id,
      type: "databaseSchema",
      position: { x: 0, y: 0 }, // Position will be set by the frontend
      data: {
        label: table.name,
        schema: table.tableColumns.map((column) => ({
          title: column.name,
          type: column.dataType,
          isNotNull: !column.isNullable,
          defaultValue: column.defaultValue || "",
          // Add other properties as needed
        })),
      },
    }));

    // Create edges from relationships, with defensive checks
    const edges = tables.flatMap((table) => {
      if (!table.sourceRelationships || !Array.isArray(table.sourceRelationships)) {
        return [];
      }
      
      return table.sourceRelationships
        .filter(rel => 
          rel && 
          rel.sourceColumn && 
          rel.targetColumn && 
          rel.targetTable
        )
        .map((rel) => ({
          id: rel.id,
          source: table.id,
          target: rel.targetTable.id,
          sourceHandle: rel.sourceColumn.name,
          targetHandle: rel.targetColumn.name,
          type: "databaseSchema",
          label: `${rel.relationshipType}`,
        }));
    });

    // console.log("Nodes:", nodes);
    // console.log("Edges:", edges);

    // Ensure we're returning a valid object
    return NextResponse.json({ 
      nodes: nodes || [], 
      edges: edges || [] 
    });
  } catch (error) {
    console.error("Error retrieving schema:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
