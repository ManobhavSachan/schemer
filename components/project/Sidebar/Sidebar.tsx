"use client";
import { BookOpen, Bot, Settings2, SquareTerminal } from "lucide-react";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { Group } from "./Group";
import { useNodes, useReactFlow } from "@xyflow/react";
import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function AppSidebar() {
  const nodes = useNodes();
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
        <Button
          onClick={handleAddTable}
          variant="default"
          className="mx-4 my-4"
        >
          + Add Table
        </Button>
        <Group tables={nodes as DatabaseSchemaNode[]} />
      </SidebarContent>
    </Sidebar>
  );
}
