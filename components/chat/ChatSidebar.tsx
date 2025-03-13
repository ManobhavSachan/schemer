"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { ToolCallApproval } from "./ToolCallApproval";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatSidebarProps {
  className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingToolCall, setPendingToolCall] = useState<any>(null);
  const [isToolCallDialogOpen, setIsToolCallDialogOpen] = useState(false);

  // Listen for toggle-chat events from the Canvas component
  useEffect(() => {
    const handleToggleChat = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener("toggle-chat", handleToggleChat);
    return () => {
      window.removeEventListener("toggle-chat", handleToggleChat);
    };
  }, []);

  // Handle tool call approval
  const handleToolCallApprove = async () => {
    if (!pendingToolCall) return;

    try {
      // Send the approved tool call to the API
      const response = await fetch("/api/chat/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolName: pendingToolCall.name,
          args: pendingToolCall.args,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to execute tool call");
      }

      // Close the dialog
      setIsToolCallDialogOpen(false);
      setPendingToolCall(null);
    } catch (error) {
      console.error("Error executing tool call:", error);
    }
  };

  // Handle tool call rejection
  const handleToolCallReject = () => {
    setIsToolCallDialogOpen(false);
    setPendingToolCall(null);
  };

  // Listen for tool call events from the chat interface
  useEffect(() => {
    const handleToolCall = (event: CustomEvent) => {
      const toolCall = event.detail;
      setPendingToolCall(toolCall);
      setIsToolCallDialogOpen(true);
    };

    window.addEventListener("tool-call" as any, handleToolCall);
    return () => {
      window.removeEventListener("tool-call" as any, handleToolCall);
    };
  }, []);

  // Create a chat sidebar trigger button
  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>

      {/* Chat Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-20 w-[500px] transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <div className="flex h-full flex-col rounded-l-lg border-l border-sidebar-border bg-sidebar shadow-xl">
          <div className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Design</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4">
            <ChatInterface />
          </div>
        </div>
      </div>

      {/* Tool call approval dialog */}
      {pendingToolCall && (
        <ToolCallApproval
          toolCall={pendingToolCall}
          isOpen={isToolCallDialogOpen}
          onApprove={handleToolCallApprove}
          onReject={handleToolCallReject}
        />
      )}
    </>
  );
}