"use client";

import { ChevronRight, type LucideIcon, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReactFlow } from "@xyflow/react";

export function Group({
  tables,
}: {
  tables: DatabaseSchemaNode[];
}) {
  const { setNodes } = useReactFlow();
  // Track open state for each table
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({});
  // Update the ref type to accept HTMLLIElement
  const tableRefs = useRef<Record<string, HTMLLIElement | null>>({});
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  // Add state for editing values
  const [editingValues, setEditingValues] = useState<{
    tableId: string;
    columnTitle: string;
    field: 'title' | 'type';
    value: string;
  } | null>(null);

  // Update open states and scroll to selected table
  useEffect(() => {
    const newOpenStates = { ...openStates };
    tables.forEach((table) => {
      if (table.selected) {
        newOpenStates[table.id] = true;
        // Scroll the selected table into view
        setTimeout(() => {
          tableRefs.current[table.id]?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }, 100); // Small delay to ensure the collapsible has opened
      }
    });
    setOpenStates(newOpenStates);
  }, [tables]);

  // Filter tables based on search query
  const filteredTables = tables.filter((table) =>
    table.data.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddColumn = (tableId: string) => {
    // Find the table in the tables array
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    // Create a new column with default values
    const newColumn = {
      title: `New Column ${table.data.schema.length + 1}`,
      type: 'text'
    };

    // Update the table's schema
    table.data.schema = [...table.data.schema, newColumn];
    setNodes((nds) => nds.map((node) => node.id === tableId ? {
      ...node,
      data: {
        ...node.data,
        schema: table.data.schema
      }
    } : node));
  };

  const updateColumnField = (
    tableId: string,
    oldTitle: string,
    field: 'title' | 'type',
    value: string
  ) => {
    setNodes((nodes) => nodes.map((node) => {
      if (node.id === tableId) {
        const updatedSchema = node.data.schema as any[]
        updatedSchema.map((col) =>
          col.title === oldTitle ? { ...col, [field]: value } : col
        );
        console.log("updatedSchema", updatedSchema, oldTitle)
        return {
          ...node,
          data: {
            ...node.data,
            schema: updatedSchema,
          }
        };
      }
      return node;
    }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tableId: string,
    columnTitle: string,
    field: 'title' | 'type',
    currentValue: string
  ) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === 'Enter' && editingValues?.value !== currentValue) {
        updateColumnField(tableId, columnTitle, field, editingValues?.value || currentValue);
      }
      setEditingValues(null);
    }
  };

  return (
    <SidebarGroup>
      <div className="px-3 py-2 relative -mt-5">
        <Input
          type="text"
          placeholder="Search tables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <SidebarMenu>
        {filteredTables.map((table) => (
          <Collapsible
            key={table.id}
            asChild
            open={openStates[table.id]}
            defaultOpen={table.selected}
            onOpenChange={(isOpen) => {
              setOpenStates((prev) => ({
                ...prev,
                [table.id]: isOpen,
              }));
            }}
            className="group/collapsible"
          >
            <SidebarMenuItem
              ref={(el) => {
                tableRefs.current[table.id] = el;
              }}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={table.data.label}>
                  <span>{table.data.label}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>

                <SidebarMenuSub>
                
                  {table.data.schema.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title} className="flex flex-col gap-2">
                      <SidebarMenuSubButton asChild>
                        <div className="flex flex-row justify-between gap-2">
                          <Input
                            value={editingValues?.columnTitle === subItem.title && editingValues?.field === 'title' 
                              ? editingValues.value 
                              : subItem.title}
                            onChange={(e) => setEditingValues({
                              tableId: table.id,
                              columnTitle: subItem.title,
                              field: 'title',
                              value: e.target.value
                            })}
                            onKeyDown={(e) => handleKeyDown(e, table.id, subItem.title, 'title', subItem.title)}
                            onBlur={() => setEditingValues(null)}
                            className="h-8"
                          />
                          <Input
                            value={editingValues?.columnTitle === subItem.title && editingValues?.field === 'type' 
                              ? editingValues.value 
                              : subItem.type}
                            onChange={(e) => setEditingValues({
                              tableId: table.id,
                              columnTitle: subItem.title,
                              field: 'type',
                              value: e.target.value
                            })}
                            onKeyDown={(e) => handleKeyDown(e, table.id, subItem.title, 'type', subItem.type)}
                            onBlur={() => setEditingValues(null)}
                            className="h-8"
                          />
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                  <Button
                    onClick={() => handleAddColumn(table.id)}
                    className="w-full"
                    variant="outline"
                  >
                    + Add Column
                  </Button>
                  
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
