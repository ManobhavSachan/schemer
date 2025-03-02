"use client";

import {
  ChevronRight,
  X,
  Pencil,
  Trash2,
  GripVertical,
  MoreVertical,
  Check,
  Key,
  Fingerprint,
  AlertCircle,
  Ban,
  Database,
} from "lucide-react";
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
import { useNodes, useReactFlow, useEdges, Edge } from "@xyflow/react";
import { useToast } from "@/hooks/use-toast";
import DeleteTableButton from "./DeleteTableButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useProject } from "@/app/(app)/project/[project_id]/ctx";
import { MoreHorizontal } from "lucide-react";

// Add a constant array of database data types
const DATABASE_DATA_TYPES = [
  // String types
  { value: "string", label: "string" },
  { value: "text", label: "text" },
  { value: "varchar", label: "varchar" },
  { value: "char", label: "char" },
  
  // Number types
  { value: "int", label: "int" },
  { value: "integer", label: "integer" },
  { value: "float", label: "float" },
  { value: "decimal", label: "decimal" },
  { value: "bigint", label: "bigint" },
  { value: "smallint", label: "smallint" },
  { value: "double", label: "double" },
  { value: "real", label: "real" },
  
  // Boolean type
  { value: "boolean", label: "boolean" },
  
  // Date and time types
  { value: "datetime", label: "datetime" },
  { value: "date", label: "date" },
  { value: "time", label: "time" },
  { value: "timestamp", label: "timestamp" },
  
  // JSON types
  { value: "json", label: "json" },
  { value: "jsonb", label: "jsonb" },
  
  // Binary types
  { value: "bytes", label: "bytes" },
  { value: "bytea", label: "bytea" },
  
  // UUID type
  { value: "uuid", label: "uuid" },
  
  // Other types
  { value: "money", label: "money" },
  { value: "serial", label: "serial" },
  { value: "bigserial", label: "bigserial" },
  { value: "xml", label: "xml" },
  { value: "inet", label: "inet" },
  { value: "cidr", label: "cidr" },
  { value: "macaddr", label: "macaddr" },
];

export function Group() {
  const { toast } = useToast();
  const nodes = useNodes() as DatabaseSchemaNode[];
  const edges = useEdges();
  const { setNodes, setEdges } = useReactFlow();

  // Use the enum functionality from the ProjectContext
  const {
    enums,
    addEnum,
    updateEnum,
    deleteEnum,
    addEnumValue,
    updateEnumValue,
    deleteEnumValue,
  } = useProject();

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
    field:
      | "title"
      | "type"
      | "isPrimaryKey"
      | "isUnique"
      | "isNotNull"
      | "defaultValue"
      | "checkExpression";
    value: string | boolean;
  } | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  // Add activeTab state to track which tab is selected
  const [activeTab, setActiveTab] = useState<"tables" | "relations" | "enums">(
    "tables"
  );
  // Add state for editing relation label
  const [editingRelationId, setEditingRelationId] = useState<string | null>(
    null
  );
  // Add state for type search
  const [typeSearchQuery, setTypeSearchQuery] = useState("");

  // Local state for UI interactions with enums
  const [editingEnumId, setEditingEnumId] = useState<string | null>(null);
  const [editingEnumValueId, setEditingEnumValueId] = useState<string | null>(
    null
  );
  const [openEnumStates, setOpenEnumStates] = useState<Record<string, boolean>>(
    {}
  );
  const [draggedColumn, setDraggedColumn] = useState<{
    tableId: string;
    columnIndex: number;
    columnTitle: string;
  } | null>(null);

  // Add state for editing index
  const [editingIndexId, setEditingIndexId] = useState<string | null>(null);

  // Update open states and scroll to selected table
  useEffect(() => {
    const newOpenStates = { ...openStates };
    nodes.forEach((node) => {
      if (node.selected) {
        newOpenStates[node.id] = true;
        // Scroll the selected table into view
        setTimeout(() => {
          tableRefs.current[node.id]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100); // Small delay to ensure the collapsible has opened
      }
    });
    setOpenStates(newOpenStates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // Filter tables based on search query
  const filteredTables = nodes.filter((node) =>
    node.data.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter enums based on search query
  const filteredEnums = enums.filter((enumItem) =>
    enumItem.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter data types based on search query
  const filteredDataTypes = DATABASE_DATA_TYPES.filter(dataType => 
    dataType.label.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );

  const handleAddIndex = (tableId: string) => {
    // Find the table in the nodes array
    const table = nodes.find((n) => n.id === tableId);
    if (!table) return;

    // Create a new index with default values
    const newIndex = {
      id: `idx-${Date.now()}`,
      name: `idx_${table.data.label.toLowerCase()}_${
        (table.data.indexes?.length || 0) + 1
      }`,
      columns: [],
      isUnique: false,
    };

    // Update the table's indexes
    const currentIndexes = table.data.indexes || [];

    setNodes((nds) =>
      nds.map((node) =>
        node.id === tableId
          ? {
              ...node,
              data: {
                ...node.data,
                indexes: [...currentIndexes, newIndex],
              },
            }
          : node
      )
    );

    toast({
      title: "Index created",
      description: `New index "${newIndex.name}" has been created`,
    });
  };

  const handleDeleteIndex = (tableId: string, indexId: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === tableId && node.data.indexes) {
          const indexes = node.data.indexes as Array<{
            id: string;
            name: string;
            columns: string[];
            isUnique: boolean;
          }>;
          return {
            ...node,
            data: {
              ...node.data,
              indexes: indexes.filter((idx) => idx.id !== indexId),
            },
          };
        }
        return node;
      })
    );

    toast({
      title: "Index deleted",
      description: "The index has been removed",
    });
  };

  const handleEditIndex = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tableId: string,
    indexId: string,
    currentValue: string
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === "Enter" && e.currentTarget.value !== currentValue) {
        setNodes((nodes) =>
          nodes.map((node) => {
            if (node.id === tableId && node.data.indexes) {
              const indexes = node.data.indexes as Array<{
                id: string;
                name: string;
                columns: string[];
                isUnique: boolean;
              }>;
              return {
                ...node,
                data: {
                  ...node.data,
                  indexes: indexes.map((idx) =>
                    idx.id === indexId
                      ? { ...idx, name: e.currentTarget.value }
                      : idx
                  ),
                },
              };
            }
            return node;
          })
        );
      }
      setEditingIndexId(null);
    }
  };

  const toggleColumnInIndex = (
    tableId: string,
    indexId: string,
    columnName: string
  ) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === tableId && node.data.indexes) {
          const indexes = node.data.indexes as Array<{
            id: string;
            name: string;
            columns: string[];
            isUnique: boolean;
          }>;
          return {
            ...node,
            data: {
              ...node.data,
              indexes: indexes.map((idx) => {
                if (idx.id === indexId) {
                  const columns = [...idx.columns];
                  const columnIndex = columns.indexOf(columnName);

                  if (columnIndex >= 0) {
                    // Remove column if already in the index
                    columns.splice(columnIndex, 1);
                  } else {
                    // Add column if not in the index
                    columns.push(columnName);
                  }

                  return { ...idx, columns };
                }
                return idx;
              }),
            },
          };
        }
        return node;
      })
    );
  };

  const toggleIndexUnique = (tableId: string, indexId: string) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === tableId && node.data.indexes) {
          const indexes = node.data.indexes as Array<{
            id: string;
            name: string;
            columns: string[];
            isUnique: boolean;
          }>;
          return {
            ...node,
            data: {
              ...node.data,
              indexes: indexes.map((idx) => {
                if (idx.id === indexId) {
                  return { ...idx, isUnique: !idx.isUnique };
                }
                return idx;
              }),
            },
          };
        }
        return node;
      })
    );
  };

  const handleAddColumn = (tableId: string) => {
    // Find the table in the tables array
    const table = nodes.find((n) => n.id === tableId);
    if (!table) return;

    // Create a new column with default values
    const newColumn = {
      title: `New Column ${table.data.schema.length + 1}`,
      type: "text",
      isPrimaryKey: false,
      isUnique: false,
      isNotNull: false,
      defaultValue: "",
    };

    // Update the table's schema
    table.data.schema = [...table.data.schema, newColumn];
    setNodes((nds) =>
      nds.map((node) =>
        node.id === tableId
          ? {
              ...node,
              data: {
                ...node.data,
                schema: table.data.schema,
              },
            }
          : node
      )
    );
  };

  const updateColumnField = (
    tableId: string,
    oldTitle: string,
    field:
      | "title"
      | "type"
      | "isPrimaryKey"
      | "isUnique"
      | "isNotNull"
      | "defaultValue"
      | "checkExpression",
    value: string | boolean
  ) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === tableId) {
          const updatedSchema = (
            node.data.schema as DatabaseSchemaNode["data"]["schema"]
          ).map((col) => {
            if (col.title === oldTitle) {
              return { ...col, [field]: value };
            }
            return col;
          });
          return {
            ...node,
            data: {
              ...node.data,
              schema: updatedSchema,
            },
          };
        }
        return node;
      })
    );
  };

  // Update the handleKeyDown function to handle boolean values
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tableId: string,
    columnTitle: string,
    field:
      | "title"
      | "type"
      | "isPrimaryKey"
      | "isUnique"
      | "isNotNull"
      | "defaultValue"
      | "checkExpression",
    currentValue: string | boolean
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === "Enter" && editingValues?.value !== currentValue) {
        // Only update if the field is a string type (title, type, defaultValue)
        if (field === "title" || field === "type" || field === "defaultValue") {
          if (typeof editingValues?.value === "string") {
            updateColumnField(tableId, columnTitle, field, editingValues.value);
          }
        }
        // Boolean fields are handled directly in their respective handlers
      }
      setEditingValues(null);
    }
  };

  const handleCollapseAll = () => {
    // Create an object with all table IDs set to false
    const allClosed = nodes.reduce((acc, node) => {
      acc[node.id] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setOpenStates(allClosed);
  };

  const handleDeleteTable = (tableId: string) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== tableId));
  };

  const handleEditTable = (tableId: string) => {
    setEditingTableId(tableId);
  };

  const handleTableLabelEdit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tableId: string,
    currentValue: string
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === "Enter" && e.currentTarget.value !== currentValue) {
        setNodes((nodes) =>
          nodes.map((node) =>
            node.id === tableId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    label: e.currentTarget.value,
                  },
                }
              : node
          )
        );
      }
      setEditingTableId(null);
    }
  };

  // Handler for creating a new relation between tables
  const handleAddRelation = () => {
    // In a real implementation, this would open a UI to select source and target tables/columns
    toast({
      title: "Create Relation",
      description:
        "Select source and target tables/columns in the canvas to create a relation",
    });
  };

  // Handler for deleting a relation
  const handleDeleteRelation = (edgeId: string) => {
    setEdges((edges) => edges.filter((edge) => edge.id !== edgeId));
    toast({
      title: "Relation deleted",
      description: "The relation has been removed",
    });
  };

  // Handler for editing a relation label
  const handleRelationLabelEdit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    edgeId: string,
    currentValue: string
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === "Enter" && e.currentTarget.value !== currentValue) {
        setEdges((edges) =>
          edges.map((edge) =>
            edge.id === edgeId
              ? {
                  ...edge,
                  label: e.currentTarget.value,
                }
              : edge
          )
        );
      }
      setEditingRelationId(null);
    }
  };

  // Get table name from table ID
  const getTableName = (tableId: string) => {
    const table = nodes.find((node) => node.id === tableId);
    return table ? table.data.label : "Unknown Table";
  };

  // Get column name from table ID and column handle
  const getColumnName = (tableId: string, columnHandle: string | undefined) => {
    if (!columnHandle) return "Unknown Column";

    const table = nodes.find((node) => node.id === tableId);
    if (!table) return "Unknown Column";

    const column = table.data.schema.find((col) => col.title === columnHandle);
    return column ? column.title : "Unknown Column";
  };

  // Generate a descriptive relation name based on connected tables and columns
  const getDefaultRelationName = (edge: Edge) => {
    const sourceTable = getTableName(edge.source);
    const targetTable = getTableName(edge.target);
    const sourceColumn = getColumnName(
      edge.source,
      edge.sourceHandle ?? undefined
    );
    // const targetColumn = getColumnName(edge.target, edge.targetHandle ?? undefined);

    // Format: sourceTable_sourceColumn_targetTable
    return `${sourceTable}_${sourceColumn}_${targetTable}`;
  };

  // Handler for creating a new enum
  const handleAddEnum = () => {
    const newEnumName = `NewEnum${enums.length + 1}`;
    addEnum(newEnumName);

    // Open the new enum in the UI
    const newEnumId = `enum-${Date.now()}`;
    setOpenEnumStates((prev) => ({
      ...prev,
      [newEnumId]: true,
    }));

    toast({
      title: "Enum created",
      description: `New enum "${newEnumName}" has been created`,
    });
  };

  // Handler for editing an enum name
  const handleEditEnum = (enumId: string) => {
    setEditingEnumId(enumId);
  };

  // Handler for enum name edit
  const handleEnumNameEdit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    enumId: string,
    currentValue: string
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === "Enter" && e.currentTarget.value !== currentValue) {
        updateEnum(enumId, e.currentTarget.value);
      }
      setEditingEnumId(null);
    }
  };

  // Handler for deleting an enum
  const handleDeleteEnum = (enumId: string) => {
    deleteEnum(enumId);
    toast({
      title: "Enum deleted",
      description: "The enum has been removed",
    });
  };

  // Handler for adding a new enum value
  const handleAddEnumValue = (enumId: string) => {
    const enumItem = enums.find((e) => e.id === enumId);
    if (enumItem) {
      addEnumValue(enumId, `VALUE_${enumItem.values.length + 1}`);
    }
  };

  // Handler for editing an enum value
  const handleEditEnumValue = (
    e: React.KeyboardEvent<HTMLInputElement>,
    enumId: string,
    valueId: string,
    currentValue: string
  ) => {
    if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.currentTarget.blur();
      if (e.key === "Enter" && e.currentTarget.value !== currentValue) {
        updateEnumValue(enumId, valueId, e.currentTarget.value);
      }
      setEditingEnumValueId(null);
    }
  };

  // Handler for deleting an enum value
  const handleDeleteEnumValue = (enumId: string, valueId: string) => {
    deleteEnumValue(enumId, valueId);
  };

  // Handler for collapsing all enums
  const handleCollapseAllEnums = () => {
    const allClosed = enums.reduce((acc, enumItem) => {
      acc[enumItem.id] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setOpenEnumStates(allClosed);
  };

  // Add handler for coming soon tabs
  const handleComingSoonTab = () => {
    toast({
      title: "Coming soon",
      description: "This feature is currently under development",
    });
  };

  // Get enum type display name
  const getEnumTypeDisplay = (type: string) => {
    // Check if the type is an enum reference
    if (type.startsWith("enum:")) {
      const enumId = type.split(":")[1];
      const enumItem = enums.find((e) => e.id === enumId);
      return enumItem ? `enum(${enumItem.name})` : type;
    }
    return type;
  };

  // Function to reorder columns within a table
  const reorderColumns = (
    tableId: string,
    startIndex: number,
    endIndex: number
  ) => {
    if (startIndex === endIndex) return;

    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === tableId) {
          const newSchema = [
            ...(node.data.schema as DatabaseSchemaNode["data"]["schema"]),
          ];
          const [removed] = newSchema.splice(startIndex, 1);
          newSchema.splice(endIndex, 0, removed);

          return {
            ...node,
            data: {
              ...node.data,
              schema: newSchema,
            },
          };
        }
        return node;
      })
    );

    toast({
      title: "Column reordered",
      description: "The column position has been updated",
    });
  };

  // Handle drag start
  const handleDragStart = (
    tableId: string,
    columnIndex: number,
    columnTitle: string
  ) => {
    setDraggedColumn({
      tableId,
      columnIndex,
      columnTitle,
    });
  };

  // Handle drag over another column
  const handleDragOver = (
    e: React.DragEvent<HTMLLIElement>,
    tableId: string,
    columnIndex: number
  ) => {
    e.preventDefault();

    if (!draggedColumn || draggedColumn.tableId !== tableId) return;

    if (draggedColumn.columnIndex !== columnIndex) {
      // Highlight the drop area
      e.currentTarget.classList.add("bg-muted");
    }
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.classList.remove("bg-muted");
  };

  // Handle drop
  const handleDrop = (
    e: React.DragEvent<HTMLLIElement>,
    tableId: string,
    columnIndex: number
  ) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-muted");

    if (!draggedColumn || draggedColumn.tableId !== tableId) return;

    if (draggedColumn.columnIndex !== columnIndex) {
      reorderColumns(tableId, draggedColumn.columnIndex, columnIndex);
    }

    setDraggedColumn(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  return (
    <SidebarGroup>
      <Tabs
        defaultValue="tables"
        className="-mt-5 mb-1 mx-2"
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "tables" | "relations" | "enums")
        }
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
          <TabsTrigger value="enums">Enums</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="px-3 py-2 relative mb-1 flex flex-row gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder={
              activeTab === "tables"
                ? "Search tables..."
                : activeTab === "relations"
                ? "Search relations..."
                : "Search enums..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        {activeTab === "tables" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="h-10 w-[30%]"
          >
            Collapse All
          </Button>
        ) : activeTab === "relations" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRelation}
            className="h-10 w-[30%]"
          >
            + Relation
          </Button>
        ) : activeTab === "enums" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddEnum}
            className="h-10 w-[30%]"
          >
            + Enum
          </Button>
        ) : null}
      </div>

      {activeTab === "tables" && (
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
                    {editingTableId === table.id ? (
                      <Input
                        value={table.data.label}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          setNodes((nodes) =>
                            nodes.map((node) =>
                              node.id === table.id
                                ? {
                                    ...node,
                                    data: {
                                      ...node.data,
                                      label: e.target.value,
                                    },
                                  }
                                : node
                            )
                          );
                        }}
                        onKeyDown={(e) =>
                          handleTableLabelEdit(e, table.id, table.data.label)
                        }
                        onBlur={() => setEditingTableId(null)}
                        className="h-7 ring-0 focus-visible:ring-0 w-full border-none outline-none"
                      />
                    ) : (
                      <span>{table.data.label}</span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <DeleteTableButton
                        onDelete={() => handleDeleteTable(table.id)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTable(table.id)}
                        className="hover:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {table.data.schema.map((subItem, columnIndex) => (
                      <SidebarMenuSubItem
                        key={`${subItem.title}-${subItem.type}`}
                        className={`flex flex-col gap-2 hover:bg-transparent !data-[state=selected]:bg-transparent transition-colors duration-200 ${
                          draggedColumn?.tableId === table.id &&
                          draggedColumn?.columnIndex === columnIndex
                            ? "opacity-50"
                            : ""
                        }`}
                        draggable={true}
                        onDragStart={(e) => {
                          // Only allow dragging if initiated from the drag handle or if data-dragging is set
                          const target = e.target as HTMLElement;
                          const isDragHandle = target.closest(".drag-handle");
                          const row = target.closest('[draggable="true"]');

                          if (
                            !isDragHandle &&
                            !row?.getAttribute("data-dragging")
                          ) {
                            e.preventDefault();
                            return;
                          }

                          // Clear the dragging attribute
                          if (row) {
                            row.removeAttribute("data-dragging");
                          }

                          handleDragStart(table.id, columnIndex, subItem.title);
                        }}
                        onDragOver={(e) =>
                          handleDragOver(e, table.id, columnIndex)
                        }
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, table.id, columnIndex)}
                        onDragEnd={handleDragEnd}
                        data-dragged={
                          draggedColumn?.tableId === table.id &&
                          draggedColumn?.columnIndex === columnIndex
                        }
                      >
                        <SidebarMenuSubButton
                          asChild
                          className="hover:bg-transparent active:bg-transparent"
                        >
                          <div className="flex flex-row justify-between h-8 gap-1">
                            <div className="flex items-center gap-1 w-[70%]">
                              <div
                                className="cursor-grab active:cursor-grabbing pr-1.5 hover:bg-muted rounded drag-handle flex items-center justify-center transition-colors"
                                onMouseDown={(e) => {
                                  // Make the entire row draggable when clicking on the handle
                                  const row =
                                    e.currentTarget.closest(
                                      '[draggable="true"]'
                                    );
                                  if (row) {
                                    // This will make the row the drag target
                                    row.setAttribute("data-dragging", "true");
                                  }
                                }}
                              >
                                <GripVertical className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="flex-1 flex items-center">
                                <div className="flex gap-0.5 mr-1">
                                  {subItem.isPrimaryKey && (
                                    <span title="Primary">
                                      <Key className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  )}
                                  {subItem.isUnique && (
                                    <span title="Unique">
                                      <Fingerprint className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  )}
                                  {subItem.isNotNull && (
                                    <span title="Not Null">
                                      <Ban className="h-3 w-3 text-muted-foreground" />
                                    </span>
                                  )}
                                </div>
                                <Input
                                  value={
                                    editingValues?.tableId === table.id &&
                                    editingValues?.columnTitle ===
                                      subItem.title &&
                                    editingValues?.field === "title" &&
                                    typeof editingValues.value === "string"
                                      ? editingValues.value
                                      : subItem.title
                                  }
                                  onChange={(e) =>
                                    setEditingValues({
                                      tableId: table.id,
                                      columnTitle: subItem.title,
                                      field: "title",
                                      value: e.target.value,
                                    })
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyDown(
                                      e,
                                      table.id,
                                      subItem.title,
                                      "title",
                                      subItem.title
                                    )
                                  }
                                  onBlur={() => setEditingValues(null)}
                                  className="h-7 flex-1"
                                />
                              </div>
                            </div>
                            <div className="relative w-[30%]">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="h-7 w-full justify-between font-normal text-xs"
                                  >
                                    {getEnumTypeDisplay(
                                      editingValues?.tableId === table.id &&
                                        editingValues?.columnTitle ===
                                          subItem.title &&
                                        editingValues?.field === "type" &&
                                        typeof editingValues.value === "string"
                                        ? editingValues.value
                                        : subItem.type
                                    )}
                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px]">
                                  <div className="px-2 py-2 sticky top-0 bg-background z-10 border-b">
                                    <Input
                                      placeholder="Search types..."
                                      value={typeSearchQuery}
                                      onChange={(e) => {
                                        const input = e.target as HTMLInputElement;
                                        setTypeSearchQuery(input.value);
                                      }}
                                      className="h-7"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="max-h-[300px] overflow-y-auto">
                                    {filteredDataTypes.map((dataType) => (
                                      <DropdownMenuItem
                                        key={dataType.value}
                                        onSelect={() => {
                                          updateColumnField(
                                            table.id,
                                            subItem.title,
                                            "type",
                                            dataType.value
                                          );
                                          setTypeSearchQuery(""); // Reset search after selection
                                        }}
                                      >
                                        {dataType.label}
                                      </DropdownMenuItem>
                                    ))}
                                    {filteredDataTypes.length === 0 && (
                                      <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                                        No types found
                                      </div>
                                    )}
                                  </div>
                                  {enums.length > 0 && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <div className="px-2 py-1.5 text-xs font-semibold">
                                        Enums
                                      </div>
                                      <div className="max-h-[150px] overflow-y-auto">
                                        {enums
                                          .filter(enumItem => 
                                            enumItem.name.toLowerCase().includes(typeSearchQuery.toLowerCase())
                                          )
                                          .map((enumItem) => (
                                            <DropdownMenuItem
                                              key={enumItem.id}
                                              onSelect={() => {
                                                updateColumnField(
                                                  table.id,
                                                  subItem.title,
                                                  "type",
                                                  `enum:${enumItem.id}`
                                                );
                                                setTypeSearchQuery(""); // Reset search after selection
                                              }}
                                            >
                                              {enumItem.name}
                                            </DropdownMenuItem>
                                          ))}
                                        {enums.filter(enumItem => 
                                          enumItem.name.toLowerCase().includes(typeSearchQuery.toLowerCase())
                                        ).length === 0 && typeSearchQuery && (
                                          <div className="px-2 py-2 text-sm text-muted-foreground text-center">
                                            No enums found
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="ml-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-muted"
                                  >
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <div className="px-2 py-2">
                                    <div className="text-xs mb-1 font-medium">
                                      Default Value
                                    </div>
                                    <Input
                                      value={subItem.defaultValue || ""}
                                      placeholder="Set default value..."
                                      className="h-7 w-full"
                                      onChange={(e) => {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "defaultValue",
                                          e.target.value
                                        );
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          e.currentTarget.blur();
                                          toast({
                                            title: "Default Value Set",
                                            description: `Default value for "${subItem.title}" has been updated`,
                                          });
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <div className="px-2 py-2">
                                    <div className="text-xs mb-1 font-medium">
                                      Check Expression
                                    </div>
                                    <Input
                                      value={subItem.checkExpression || ""}
                                      placeholder="e.g. value > 0"
                                      className="h-7 w-full"
                                      onChange={(e) => {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "checkExpression",
                                          e.target.value
                                        );
                                      }}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          e.currentTarget.blur();
                                          toast({
                                            title: "Check Expression Set",
                                            description: `Check constraint for "${subItem.title}" has been updated`,
                                          });
                                        }
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      const isPrimaryKey =
                                        subItem.isPrimaryKey || false;
                                      // When setting primary key, also set unique and not null
                                      if (!isPrimaryKey) {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isPrimaryKey",
                                          true
                                        );
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isUnique",
                                          true
                                        );
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isNotNull",
                                          true
                                        );
                                        toast({
                                          title: "Primary Key Set",
                                          description: `Column "${subItem.title}" is now a primary key (unique and not null)`,
                                        });
                                      } else {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isPrimaryKey",
                                          false
                                        );
                                        toast({
                                          title: "Primary Key Removed",
                                          description: `Column "${subItem.title}" is no longer a primary key`,
                                        });
                                      }
                                    }}
                                  >
                                    <div className="flex items-center w-full">
                                      {subItem.isPrimaryKey && (
                                        <Check className="h-4 w-4 mr-2" />
                                      )}
                                      <span className="flex items-center">
                                        <Key className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        Primary
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      const isUnique =
                                        subItem.isUnique || false;
                                      // If turning off unique and this is a primary key, also turn off primary key
                                      if (isUnique && subItem.isPrimaryKey) {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isPrimaryKey",
                                          false
                                        );
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isUnique",
                                          false
                                        );
                                        toast({
                                          title:
                                            "Unique and Primary Key Constraints Removed",
                                          description: `Column "${subItem.title}" is no longer unique or a primary key`,
                                        });
                                      } else {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isUnique",
                                          !isUnique
                                        );
                                        toast({
                                          title: isUnique
                                            ? "Unique Constraint Removed"
                                            : "Unique Constraint Set",
                                          description: `Column "${
                                            subItem.title
                                          }" is ${
                                            isUnique ? "no longer" : "now"
                                          } unique`,
                                        });
                                      }
                                    }}
                                  >
                                    <div className="flex items-center w-full">
                                      {subItem.isUnique && (
                                        <Check className="h-4 w-4 mr-2" />
                                      )}
                                      <span className="flex items-center">
                                        <Fingerprint className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        Unique
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      const isNotNull =
                                        subItem.isNotNull || false;
                                      // If turning off not null and this is a primary key, also turn off primary key
                                      if (isNotNull && subItem.isPrimaryKey) {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isPrimaryKey",
                                          false
                                        );
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isNotNull",
                                          false
                                        );
                                        toast({
                                          title:
                                            "Not Null and Primary Key Constraints Removed",
                                          description: `Column "${subItem.title}" is no longer not null or a primary key`,
                                        });
                                      } else {
                                        updateColumnField(
                                          table.id,
                                          subItem.title,
                                          "isNotNull",
                                          !isNotNull
                                        );
                                        toast({
                                          title: isNotNull
                                            ? "Not Null Constraint Removed"
                                            : "Not Null Constraint Set",
                                          description: `Column "${
                                            subItem.title
                                          }" is ${
                                            isNotNull ? "no longer" : "now"
                                          } not null`,
                                        });
                                      }
                                    }}
                                  >
                                    <div className="flex items-center w-full">
                                      {subItem.isNotNull && (
                                        <Check className="h-4 w-4 mr-2" />
                                      )}
                                      <span className="flex items-center">
                                        <Ban className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        Not Null
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={() => {
                                      // Delete the column
                                      setNodes((nodes) =>
                                        nodes.map((node) => {
                                          if (node.id === table.id) {
                                            const updatedSchema = (
                                              node.data
                                                .schema as DatabaseSchemaNode["data"]["schema"]
                                            ).filter(
                                              (col) =>
                                                col.title !== subItem.title
                                            );
                                            return {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                schema: updatedSchema,
                                              },
                                            };
                                          }
                                          return node;
                                        })
                                      );
                                      toast({
                                        title: "Column Deleted",
                                        description: `Column "${subItem.title}" has been deleted`,
                                      });
                                    }}
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}

                    {/* Indexes section */}
                    {table.data.indexes && table.data.indexes.length > 0 && (
                      <>
                        <div className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground">
                          Indexes
                        </div>
                        {(
                          table.data.indexes as Array<{
                            id: string;
                            name: string;
                            columns: string[];
                            isUnique: boolean;
                          }>
                        ).map((index) => (
                          <SidebarMenuSubItem
                            key={index.id}
                            className="flex flex-col gap-1 hover:bg-transparent !data-[state=selected]:bg-transparent transition-colors duration-200"
                          >
                            <div className="flex flex-row justify-between h-8 gap-1 px-3 py-1">
                              <div className="flex items-center gap-1 flex-1">
                                <Database className="h-3 w-3 text-muted-foreground mr-1" />
                                {editingIndexId === index.id ? (
                                  <Input
                                    value={index.name}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      setNodes((nodes) =>
                                        nodes.map((node) => {
                                          if (
                                            node.id === table.id &&
                                            node.data.indexes
                                          ) {
                                            const indexes = node.data
                                              .indexes as Array<{
                                              id: string;
                                              name: string;
                                              columns: string[];
                                              isUnique: boolean;
                                            }>;
                                            return {
                                              ...node,
                                              data: {
                                                ...node.data,
                                                indexes: indexes.map((idx) =>
                                                  idx.id === index.id
                                                    ? {
                                                        ...idx,
                                                        name: e.target.value,
                                                      }
                                                    : idx
                                                ),
                                              },
                                            };
                                          }
                                          return node;
                                        })
                                      );
                                    }}
                                    onKeyDown={(e) =>
                                      handleEditIndex(
                                        e,
                                        table.id,
                                        index.id,
                                        index.name
                                      )
                                    }
                                    onBlur={() => setEditingIndexId(null)}
                                    className="h-7 flex-1"
                                  />
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <span className="cursor-default">
                                      {index.name}
                                    </span>
                                    {index.isUnique && (
                                      <span className="text-xs text-muted-foreground ml-1">
                                        (unique)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingIndexId(index.id)}
                                  className="h-5 w-5 hover:opacity-50"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleDeleteIndex(table.id, index.id)
                                  }
                                  className="h-7 w-7 hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 hover:bg-muted"
                                    >
                                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onSelect={() =>
                                        toggleIndexUnique(table.id, index.id)
                                      }
                                    >
                                      <div className="flex items-center w-full">
                                        {index.isUnique && (
                                          <Check className="h-4 w-4 mr-2" />
                                        )}
                                        <span>Unique Index</span>
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <div className="px-2 py-1.5 text-xs font-semibold">
                                      Columns
                                    </div>
                                    {table.data.schema.map((column) => (
                                      <DropdownMenuItem
                                        key={column.title}
                                        onSelect={() =>
                                          toggleColumnInIndex(
                                            table.id,
                                            index.id,
                                            column.title
                                          )
                                        }
                                      >
                                        <div className="flex items-center w-full">
                                          {index.columns.includes(
                                            column.title
                                          ) && (
                                            <Check className="h-4 w-4 mr-2" />
                                          )}
                                          <span>{column.title}</span>
                                        </div>
                                      </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onSelect={() =>
                                        handleDeleteIndex(table.id, index.id)
                                      }
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {index.columns.length > 0 && (
                              <div className="px-7 pb-1 text-xs text-muted-foreground">
                                {index.columns.join(", ")}
                              </div>
                            )}
                          </SidebarMenuSubItem>
                        ))}
                      </>
                    )}

                    <div className="flex flex-row justify-between mt-1 gap-2 mx-1">
                      <Button
                        onClick={() => handleAddIndex(table.id)}
                        className="w-full"
                        variant="outline"
                      >
                        + Index
                      </Button>
                      <Button
                        onClick={() => handleAddColumn(table.id)}
                        className="w-full"
                        variant="outline"
                      >
                        + Column
                      </Button>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      )}

      {activeTab === "relations" && (
        <SidebarMenu>
          {edges
            .filter(
              (edge) =>
                !searchQuery ||
                (edge.label &&
                  edge.label
                    .toString()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())) ||
                getTableName(edge.source)
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                getTableName(edge.target)
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            )
            .map((edge) => (
              <SidebarMenuItem key={edge.id} className="hover:bg-muted/30">
                <div className="w-full px-3 py-2 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    {editingRelationId === edge.id ? (
                      <Input
                        value={edge.label?.toString() || ""}
                        autoFocus
                        onChange={(evt) => {
                          const newValue = evt.currentTarget.value;
                          setEdges((edges) =>
                            edges.map((e) =>
                              e.id === edge.id
                                ? {
                                    ...e,
                                    label: newValue,
                                  }
                                : e
                            )
                          );
                        }}
                        onKeyDown={(e) =>
                          handleRelationLabelEdit(
                            e,
                            edge.id,
                            edge.label?.toString() || ""
                          )
                        }
                        onBlur={() => setEditingRelationId(null)}
                        className="h-7 w-full"
                      />
                    ) : (
                      <div className="flex items-center gap-1 flex-grow">
                        <div
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() => setEditingRelationId(edge.id)}
                        >
                          {edge.label || getDefaultRelationName(edge)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingRelationId(edge.id)}
                        className="hover:opacity-50"
                        aria-label="Edit relation"
                        title="Edit relation"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <button
                        onClick={() => handleDeleteRelation(edge.id)}
                        aria-label="Delete relation"
                        title="Delete relation"
                        className="hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getTableName(edge.source)}.
                    {getColumnName(edge.source, edge.sourceHandle ?? undefined)}{" "}
                    → {getTableName(edge.target)}.
                    {getColumnName(edge.target, edge.targetHandle ?? undefined)}
                  </div>
                </div>
              </SidebarMenuItem>
            ))}
          {edges.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              No relations found. Create relations by connecting table columns
              in the canvas.
            </div>
          )}
        </SidebarMenu>
      )}

      {activeTab === "enums" && (
        <SidebarMenu>
          {filteredEnums.map((enumItem) => (
            <Collapsible
              key={enumItem.id}
              asChild
              open={openEnumStates[enumItem.id]}
              onOpenChange={(isOpen) => {
                setOpenEnumStates((prev) => ({
                  ...prev,
                  [enumItem.id]: isOpen,
                }));
              }}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={enumItem.name}>
                    {editingEnumId === enumItem.id ? (
                      <Input
                        value={enumItem.name}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          updateEnum(enumItem.id, e.currentTarget.value);
                        }}
                        onKeyDown={(e) =>
                          handleEnumNameEdit(e, enumItem.id, enumItem.name)
                        }
                        onBlur={() => setEditingEnumId(null)}
                        className="h-7 ring-0 focus-visible:ring-0 w-full border-none outline-none"
                      />
                    ) : (
                      <span>{enumItem.name}</span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEnum(enumItem.id)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEnum(enumItem.id)}
                        className="hover:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {enumItem.values.map((value) => (
                      <SidebarMenuSubItem
                        key={value.id}
                        className="flex flex-row justify-between items-center px-3 py-1 hover:bg-muted/30"
                      >
                        {editingEnumValueId === value.id ? (
                          <Input
                            value={value.value}
                            autoFocus
                            onChange={(e) => {
                              updateEnumValue(
                                enumItem.id,
                                value.id,
                                e.currentTarget.value
                              );
                            }}
                            onKeyDown={(e) =>
                              handleEditEnumValue(
                                e,
                                enumItem.id,
                                value.id,
                                value.value
                              )
                            }
                            onBlur={() => setEditingEnumValueId(null)}
                            className="h-7 w-full"
                          />
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span
                              className="cursor-pointer hover:underline"
                              onClick={() => setEditingEnumValueId(value.id)}
                            >
                              {value.value}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingEnumValueId(value.id)}
                                className="hover:opacity-50 h-7 w-7"
                                aria-label="Edit enum value"
                                title="Edit enum value"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  handleDeleteEnumValue(enumItem.id, value.id)
                                }
                                className="hover:text-destructive h-7 w-7"
                                aria-label="Delete enum value"
                                title="Delete enum value"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                    <div className="mt-2 px-3">
                      <Button
                        onClick={() => handleAddEnumValue(enumItem.id)}
                        className="w-full"
                        variant="outline"
                        size="sm"
                      >
                        + Value
                      </Button>
                    </div>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          {enums.length === 0 && (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              {
                'No enums found. Create an enum by clicking the "+ Enum" button.'
              }
            </div>
          )}
          {enums.length > 0 && (
            <div className="px-3 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAllEnums}
                className="w-full"
              >
                Collapse All
              </Button>
            </div>
          )}
        </SidebarMenu>
      )}
    </SidebarGroup>
  );
}
