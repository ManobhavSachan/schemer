"use client";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Group } from "./Group";
import { useEdges, useNodes, useReactFlow } from "@xyflow/react";
import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function AppSidebar() {
  const nodes = useNodes();
  const edges = useEdges();
  const { addNodes } = useReactFlow();

  const yPos = useRef(0);
  const handleAddTable = () => {
    // Add a new table node at a fixed position
    const newNode = {
      id: `${nodes.length + 1}`,
      position: { x: 100, y: yPos.current },
      type: "databaseSchema",
      data: {
        label: `Table ${nodes.length + 1}`,
        schema: [{ title: "id", type: "uuid" }],
      },
    };

    yPos.current += 10;
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
        <Group tables={nodes as DatabaseSchemaNode[]} />
      </SidebarContent>
    </Sidebar>
  );
}
