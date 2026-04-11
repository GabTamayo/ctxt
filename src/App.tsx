import { useState, useCallback } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "./components/ui/button";
import { FolderOpen } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type { FileNode } from "@/types/types";

function App() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleToggleFile = useCallback((path: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    console.log("Exporting:", Array.from(selectedFiles));
  }, [selectedFiles]);

  const handleOpenFolder = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Open Project Folder",
    });

    if (selected && typeof selected === "string") {
      setIsScanning(true);
      try {
        const nodes = await invoke<FileNode[]>("walk_directory", { path: selected });
        setFolderPath(selected);
        setFileTree(nodes);
        setSelectedFiles(new Set());
      } catch (err) {
        console.error("Failed to open folder:", err);
      } finally {
        setIsScanning(false);
      }
    }
  }, []);

  const handleExpandFolder = useCallback(async (path: string) => {
    // 1. Mark as loading
    const updateNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.map(node => {
        if (node.path === path) return { ...node, loading: true };
        if (node.children) return { ...node, children: updateNodes(node.children) };
        return node;
      });
    };
    setFileTree(prev => updateNodes(prev));

    try {
      const children = await invoke<FileNode[]>("walk_directory", { path });

      // 2. Load children and clear loading state
      const finalizeNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === path) return { ...node, children, loading: false };
          if (node.children) return { ...node, children: finalizeNodes(node.children) };
          return node;
        });
      };
      setFileTree(prev => finalizeNodes(prev));
    } catch (err) {
      console.error("Failed to expand folder:", err);
      // Clean up loading state even on error
      const errorNodes = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === path) return { ...node, loading: false };
          if (node.children) return { ...node, children: errorNodes(node.children) };
          return node;
        });
      };
      setFileTree(prev => errorNodes(prev));
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar
        folderPath={folderPath}
        onOpenFolder={handleOpenFolder}
        onChangeFolder={handleOpenFolder}
        selectedFiles={selectedFiles}
        onToggleFile={handleToggleFile}
        onExport={handleExport}
        fileTree={fileTree}
        onExpandFolder={handleExpandFolder}
        isScanning={isScanning}
      />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>

        {!folderPath ? (
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