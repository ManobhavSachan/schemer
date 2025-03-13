import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/project/Sidebar/Sidebar";
import { ProjectProvider } from "./ctx";
import { ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import { LoadingProgress } from "@/components/project/LoadingProgress";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <ProjectProvider>
        {/* App Sidebar Context */}
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1">
            <SidebarTrigger className="absolute z-10 m-2" data-sidebar-id="app-sidebar" />
            <Suspense fallback={<LoadingProgress />}>
              {children}
            </Suspense>
          </div>
        </SidebarProvider>
        
        {/* Chat Sidebar - Separate from App Sidebar */}
        <ChatSidebar />
      </ProjectProvider>
    </ReactFlowProvider>
  );
}
