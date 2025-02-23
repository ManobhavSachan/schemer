import React, { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  MarkerType,
} from "@xyflow/react";

export default function DatabaseSchemaEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(String(label || ''));
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Add this console log to debug
  console.log('Edge props:', { id, label, data });

  // Add default marker end style
  const defaultMarkerEnd: MarkerType = MarkerType.ArrowClosed;

  // Combine default style with passed style
  const combinedStyle = {
    ...style,
    markerEnd: markerEnd || defaultMarkerEnd,
  };

  const onEdgeClick = () => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  const onLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedLabel(e.target.value);
  };

  const saveLabel = () => {
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id ? { ...edge, label: editedLabel } : edge
      )
    );
    setIsEditing(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveLabel();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedLabel(String(label || ''));
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} style={combinedStyle} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all'
          }}
          className="nodrag nopan bg-popover text-popover-foreground px-2.5 py-1.5 rounded-md text-xs font-medium border shadow-sm absolute z-10 hover:cursor-pointer hover:bg-accent"
          onDoubleClick={onLabelDoubleClick}
        >
          {isEditing ? (
            <input
              type="text"
              value={String(editedLabel)}
              onChange={onLabelChange}
              onBlur={saveLabel}
              onKeyDown={onKeyDown}
              className="bg-transparent border-none outline-none w-full"
              autoFocus
            />
          ) : (
            label
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
