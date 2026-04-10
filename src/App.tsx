import { useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "./components/ui/button";
import { FolderOpen } from "lucide-react";

function App() {
  const [isFolderOpened, setIsFolderOpened] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  function handleToggleFile(path: string) {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }

  function handleExport() {
    // wire to Rust invoke() later
    console.log("Exporting:", Array.from(selectedFiles));
  }

  function handleOpenFolder() {
    // This will be replaced with a real tauri dialog call later
    setIsFolderOpened(true);
  }

  return (
    <SidebarProvider>
      <AppSidebar
        isFolderOpened={isFolderOpened}
        onOpenFolder={handleOpenFolder}
        selectedFiles={selectedFiles}
        onToggleFile={handleToggleFile}
        onExport={handleExport}
      />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>

        {!isFolderOpened ? (
          <div className="p-4">
            <Button variant="link" onClick={handleOpenFolder}>
              <FolderOpen data-icon="inline-start" />
              Open folder
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
            <p className="text-sm text-muted-foreground">
              Select files from the sidebar to export
            </p>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;