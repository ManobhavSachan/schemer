"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { ToolCallApproval } from "./ToolCallApproval";
import { cn } from "@/lib/utils";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Message } from "@ai-sdk/react";

interface ChatSidebarProps {
  className?: string;
}

interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

// Helper function to get stored messages
const getStoredMessages = (projectId: string): Message[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`chat-messages-${projectId}`);
  return stored ? JSON.parse(stored) : [];
};

// Helper function to store messages
const storeMessages = (projectId: string, messages: Message[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`chat-messages-${projectId}`, JSON.stringify(messages));
};

export function ChatSidebar({ className }: ChatSidebarProps) {
  const params = useParams();
  const projectId = params.project_id as string;
  const [isOpen, setIsOpen] = useState(false);
  const [pendingToolCall, setPendingToolCall] = useState<ToolCall | null>(null);
  const [isToolCallDialogOpen, setIsToolCallDialogOpen] = useState(false);
  const [storedMessages, setStoredMessages] = useState<Message[]>([]);

  // Initialize stored messages
  useEffect(() => {
    const messages = getStoredMessages(projectId);
    setStoredMessages(messages);
  }, [projectId]);

  // Listen for message updates
  useEffect(() => {
    const handleMessageUpdate = (event: CustomEvent<{ messages: Message[] }>) => {
      const messages = event.detail.messages;
      setStoredMessages(messages);
      storeMessages(projectId, messages);
    };

    window.addEventListener("chat-update", handleMessageUpdate as EventListener);
    return () => {
      window.removeEventListener("chat-update", handleMessageUpdate as EventListener);
    };
  }, [projectId]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault(); // Prevent browser's default action
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    const handleToolCall = (event: CustomEvent<ToolCall>) => {
      const toolCall = event.detail;
      setPendingToolCall(toolCall);
      setIsToolCallDialogOpen(true);
    };

    window.addEventListener("tool-call", handleToolCall as EventListener);
    return () => {
      window.removeEventListener("tool-call", handleToolCall as EventListener);
    };
  }, []);

  return (
    <>
      {/* Chat Sidebar */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-20 transform transition-transform duration-300 ease-in-out",
        "w-full sm:w-[500px]", // Full width on mobile, 500px on sm and up
        isOpen ? "translate-x-0" : "translate-x-full",
        className
      )}>
        <div className="flex h-full flex-col border-l border-sidebar-border bg-sidebar shadow-xl sm:rounded-l-lg">
          <div className="flex flex-row items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Design</h2>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">{navigator.platform.toLowerCase().includes('mac') ? '⌘' : 'Ctrl'}</span>
                <span className="text-xs">L</span>
              </kbd>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4">
            <ChatInterface initialMessages={storedMessages} />
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