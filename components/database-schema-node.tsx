import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useState } from "react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";

import { BaseNode } from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";

export type DatabaseSchemaNode = Node<{
  label: string;
  schema: { 
    title: string; 
    type: string;
    isPrimaryKey?: boolean;
    isUnique?: boolean;
    isNotNull?: boolean;
    defaultValue?: string;
    checkExpression?: string;
  }[];
  indexes?: { 
    id: string;
    name: string;
    columns: string[];
    isUnique: boolean;
  }[];
}>;

export function DatabaseSchemaNode({
  id,
  data,
  selected,
}: NodeProps<DatabaseSchemaNode>) {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(data.label);

  const onLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedLabel(e.target.value);
  };

  const saveLabel = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: editedLabel } }
          : node
      )
    );
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveLabel();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditedLabel(data.label);
    }
  };

  return (
    <BaseNode className="p-0" selected={selected}>
      <h2
        className="rounded-tl-md rounded-tr-md bg-secondary p-2 text-center text-sm text-muted-foreground"
        onDoubleClick={onLabelDoubleClick}
      >
        {isEditing ? (
          <input
            type="text"
            value={editedLabel}
            onChange={onLabelChange}
            onBlur={saveLabel}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent text-center border-none outline-none"
            autoFocus
          />
        ) : (
          data.label
        )}
      </h2>
      {/* shadcn Table cannot be used because of hardcoded overflow-auto */}
      <table className="border-spacing-10 overflow-visible w-[200px]">
        <TableBody>
          {data.schema.map((entry) => (
            <TableRow
              key={`${entry.title}-${entry.type}`}
              className="relative text-xs flex flex-row justify-between"
            >
              <TableCell className="pl-0 pr-6 font-light">
                <LabeledHandle
                  id={entry.title}
                  nodeId={id}
                  title={entry.title}
                  field="title"
                  type="target"
                  position={Position.Left}
                  handleClassName="p-5 pl-0 !bg-transparent border !border-none"
                />
              </TableCell>
              <TableCell className="pr-0 text-right font-thin">
                <LabeledHandle
                  id={entry.title}
                  nodeId={id}
                  title={entry.type}
                  field="type"
                  type="source"
                  position={Position.Right}
                  className="p-0 pr-3"
                  handleClassName="p-5 pr-0 !bg-transparent border !border-none"
                  labelClassName="p-0"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </table>
    </BaseNode>
  );
}
