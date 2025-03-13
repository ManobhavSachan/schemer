"use client";

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

interface ToolCallApprovalProps {
  toolCall: {
    name: string;
    args: Record<string, any>;
  };
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
  const formatArgs = (args: Record<string, any>) => {
    return JSON.stringify(args, null, 2);
  };

  // Get a human-readable description of the tool call
  const getToolDescription = (name: string, args: Record<string, any>) => {
    switch (name) {
      case "create_node":
        return `Create a new table named "${args.label}"`;
      case "edit_node":
        return `Edit the table "${args.label || args.id}"`;
      case "delete_node":
        return `Delete the table with ID "${args.id}"`;
      case "create_edge":
        return `Create a relationship from "${args.source}" to "${args.target}"`;
      case "delete_edge":
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