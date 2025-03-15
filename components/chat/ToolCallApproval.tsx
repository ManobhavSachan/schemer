"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

interface ToolCallApprovalProps {
  toolCall: ToolCall;
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export function ToolCallApproval({
  toolCall,
  isOpen,
  onApprove,
  onReject,
}: ToolCallApprovalProps) {
  // Format the tool call arguments for display
  const formatArgs = (args: Record<string, unknown>) => {
    return JSON.stringify(args, null, 2);
  };

  // Get a human-readable description of the tool call
  const getToolDescription = (name: string, args: Record<string, unknown>) => {
    switch (name) {
      case "grepTables":
        return `Grep the table "${args.label || args.id}" for "${args.query}"`;
      case "grepRelationships":
        return `Grep the relationship "${args.label || args.id}" for "${args.query}"`;
      case "grepEnums":
        return `Grep the enum "${args.label || args.id}" for "${args.query}"`;
      case "createTable":
        return `Create a new table named "${args.label}"`;
      case "createEnum":
        return `Create a new enum named "${args.label}"`;
      case "createRelationship":
        return `Create a relationship from "${args.source}" to "${args.target}"`;
      case "editTable":
        return `Edit the table "${args.label || args.id}"`;
      case "editEnum":
        return `Edit the enum "${args.label || args.id}"`;
      case "editRelationship":
        return `Edit the relationship from "${args.source}" to "${args.target}"`;
      case "deleteTable":
        return `Delete the table with ID "${args.id}"`;
      case "deleteEnum":
        return `Delete the enum with ID "${args.id}"`;
      case "deleteRelationship":
        return `Delete the relationship with ID "${args.id}"`;
      default:
        return `Execute ${name}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onReject()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Approve Schema Change</DialogTitle>
          <DialogDescription>
            The AI assistant wants to make the following change to your schema:
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-medium text-lg mb-2">
            {getToolDescription(toolCall.name, toolCall.args)}
          </h3>
          
          <div className="bg-muted rounded-md p-4 mt-2">
            <h4 className="text-sm font-medium mb-1">Function: {toolCall.name}</h4>
            <ScrollArea className="h-[200px]">
              <pre className="text-xs whitespace-pre-wrap overflow-auto">
                {formatArgs(toolCall.args)}
              </pre>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onReject}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button
            type="button"
            onClick={onApprove}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 