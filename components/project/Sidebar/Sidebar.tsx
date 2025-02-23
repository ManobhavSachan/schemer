"use client";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Group } from "./Group";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const nodes = useNodes();
  const edges = useEdges();
  const { addNodes } = useReactFlow();

  const handleAddTable = () => {
    // Add a new table node at a fixed position
    const spacing = { x: 250, y: 100 };
    const tableCount = nodes.length;
    const newNode = {
      id: `${nodes.length + 1}`,
      position: {
        x: 100 + (tableCount % 3) * spacing.x,
        y: Math.floor(tableCount / 3) * spacing.y,
      },
      type: "databaseSchema",
      data: {
        label: `Table ${tableCount + 1}`,
        schema: [
          { title: "id", type: "uuid" },
          { title: "created_at", type: "timestamp" },
        ],
      },
    };
    addNodes(newNode);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center justify-between mx-4 my-4">
          <div className="w-[70%] bg-muted text-muted-foreground rounded-md px-2 py-2 text-sm text-center">
            <span>
              {nodes.length} Table{nodes.length !== 1 && "s"}
            </span>
            <span className="mx-1">·</span>
            <span>
              {edges.length} Relation{edges.length !== 1 && "s"}
            </span>
          </div>
          <Button
            onClick={handleAddTable}
            variant="default"
            className="w-[25%]"
          >
            + Table
          </Button>
        </div>
        <Group />
      </SidebarContent>
    </Sidebar>
  );
}
