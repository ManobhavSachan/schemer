import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/project/Sidebar/Sidebar";
import { ProjectProvider } from "./ctx";
import { ReactFlowProvider } from "@xyflow/react";
import { Suspense } from "react";
import { LoadingProgress } from "@/components/project/LoadingProgress";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProjectProvider>
      <ReactFlowProvider>
        <SidebarProvider>
          <AppSidebar />
          <div className="flex-1">
            <SidebarTrigger className="absolute z-10 m-2" />
            <Suspense fallback={<LoadingProgress />}>
              {children}
            </Suspense>
          </div>
        </SidebarProvider>
      </ReactFlowProvider>
    </ProjectProvider>
  );
}
