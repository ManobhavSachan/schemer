"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Loader2, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat, Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatInterfaceProps {
  className?: string;
  initialMessages?: Message[];
}

function LoadingDots() {
  return (
    <div className="flex items-center">
      <span className="text-lg leading-3">
        <span className="inline-block animate-[loading_1.4s_ease-in-out_infinite]">.</span>
        <span className="inline-block animate-[loading_1.4s_ease-in-out_infinite_400ms]">.</span>
        <span className="inline-block animate-[loading_1.4s_ease-in-out_infinite_800ms]">.</span>
      </span>
    </div>
  );
}

export function ChatInterface({ className, initialMessages = [] }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages
  });
  const [error, setError] = useState<Error | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Emit message updates for storage
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("chat-update", {
        detail: { messages }
      })
    );
  }, [messages]);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Custom form submit handler to include file attachments
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Only proceed if there's text input or an image file
    if (!input.trim() && !imageFile) return;
    
    // Create a FileList-like object for the experimental_attachments
    let attachments: FileList | undefined = undefined;
    
    if (imageFile) {
      // Create a DataTransfer to build a FileList
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(imageFile);
      attachments = dataTransfer.files;
    }
    
    // Call the AI SDK's handleSubmit with file attachments
    try {
      handleSubmit(e, {
        experimental_attachments: attachments,
      });
    } finally {
      clearImage(); // Clear the image after submission
    }
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-2 p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="font-semibold text-xl">Schema Assistant</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Ask questions about your database schema, upload images of schema designs, or get help with SQL queries.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col space-y-2 p-4 rounded-lg",
                    message.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground max-w-[80%]"
                      : "mr-auto bg-muted max-w-[80%]"
                  )}
                >
                  <div className="text-sm">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        a: ({ node, ...props }) => <a className="text-blue-500 hover:underline" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-2" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-2" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-md font-bold mb-2" {...props} />,
                        code: ({ node, inline, className, ...props }: any) => {
                          return inline 
                            ? <code className="bg-secondary/50 px-1 py-0.5 rounded text-xs" {...props} />
                            : <code className="block bg-secondary/50 p-2 rounded text-xs overflow-x-auto my-2" {...props} />
                        },
                        pre: ({ node, ...props }) => <pre className="bg-secondary/50 p-2 rounded overflow-x-auto my-2" {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-muted-foreground pl-4 italic my-2" {...props} />,
                        hr: ({ node, ...props }) => <hr className="my-4 border-muted" {...props} />,
                        img: ({ node, ...props }) => <img className="max-w-full h-auto rounded my-2" {...props} />,
                        table: ({ node, ...props }) => <table className="border-collapse w-full my-2" {...props} />,
                        th: ({ node, ...props }) => <th className="border border-border p-2 text-left" {...props} />,
                        td: ({ node, ...props }) => <td className="border border-border p-2" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Display image attachments */}
                  {message.experimental_attachments?.filter(attachment => 
                    attachment?.contentType?.startsWith('image/')
                  ).map((attachment, index) => (
                    <div key={`${message.id}-${index}`} className="mt-2">
                      <img 
                        src={attachment.url} 
                        alt={attachment.name ?? `image-${index}`}
                        className="max-h-60 rounded-md object-contain"
                      />
                    </div>
                  ))}
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto bg-muted max-w-[80%] flex flex-col space-y-2 p-4 rounded-lg">
                  <div className="text-sm flex items-center space-x-2">
                    <span>Thinking</span>
                    <LoadingDots />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mx-4 mb-2">
          <div className="relative rounded-md border border-border overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-40 w-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80"
              onClick={clearImage}
            >
              <span className="sr-only">Remove image</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleFormSubmit} className="border-t p-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-5 w-5" />
              <span className="sr-only">Attach image</span>
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Textarea
              placeholder="Ask about your schema..."
              className="min-h-10 flex-1 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
              value={input}
              onChange={handleInputChange}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e as any);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || (!input.trim() && !imageFile)}
              className="h-9 w-9 shrink-0 rounded-full"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-500">
              Error: {error.message || "Failed to send message"}
            </p>
          )}
        </div>
      </form>
    </div>
  );
} 