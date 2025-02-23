"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { HandleProps, useReactFlow } from "@xyflow/react";
import { DatabaseSchemaNode } from "@/components/database-schema-node";
import { BaseHandle } from "@/components/base-handle";

const flexDirections = {
  top: "flex-col",
  right: "flex-row-reverse justify-end",
  bottom: "flex-col-reverse justify-end",
  left: "flex-row",
};

const LabeledHandle = React.forwardRef<
  HTMLDivElement,
  HandleProps &
    React.HTMLAttributes<HTMLDivElement> & {
      title: string;
      handleClassName?: string;
      labelClassName?: string;
      nodeId: string;
    }
>(
  (
    {
      className,
      labelClassName,
      handleClassName,
      title: initialTitle,
      position,
      nodeId,
      ...props
    },
    ref
  ) => {
    const { setNodes } = useReactFlow();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(initialTitle);

    const handleDoubleClick = () => {
      setIsEditing(true);
    };

    const handleBlur = () => {
      setIsEditing(false);
    };

    const saveLabel = () => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  schema: [
                    (node.data.schema as { title: string, type: string }[])
                    .map((schema: { title: string, type: string }) => schema.title === initialTitle ? { ...schema, title: title } : schema),
                  ],
                },
              }
            : node
        )
      );
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLInputElement).blur();
        saveLabel();
      }
    };

    return (
      <div
        ref={ref}
        title={title}
        className={cn(
          "relative flex items-center",
          flexDirections[position],
          className
        )}
      >
        <BaseHandle
          position={position}
          className={handleClassName}
          {...props}
        />
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "px-3 bg-transparent border-none outline-none text-foreground",
              labelClassName
            )}
            autoFocus
          />
        ) : (
          <label
            className={cn("px-3 text-foreground cursor-text", labelClassName)}
            onDoubleClick={handleDoubleClick}
          >
            {title}
          </label>
        )}
      </div>
    );
  }
);

LabeledHandle.displayName = "LabeledHandle";

export { LabeledHandle };
