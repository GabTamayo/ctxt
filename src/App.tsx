import { useState, useCallback } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "./components/ui/button";
import { FolderOpen } from "lucide-react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import type { FileNode } from "@/types/types";

function App() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const handleToggleFile = useCallback(async (path: string) => {
    const isSelected = selectedFiles.has(path);

    if (isSelected) {
      setSelectedFiles(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      setFileContents(prev => {
        const next = new Map(prev);
        next.delete(path);
        return next;
      });
    } else {
      setSelectedFiles(prev => new Set(prev).add(path));
      if (!fileContents.has(path)) {
        try {
          const content = await invoke<string>("read_file", { path });
          setFileContents(prev => new Map(prev).set(path, content));
        } catch (err) {
          console.error("Failed to read file:", err);
        }
      }
    }
  }, [selectedFiles, fileContents]);

  const handleExport = useCallback(async () => {
    if (selectedFiles.size === 0) return;

    const exportText = Array.from(selectedFiles)
      .map(path => {
        const content = fileContents.get(path) ?? "";
        const name = path.split(/[/\\]/).pop() ?? path;
        return `\`${name}\`\n\`\`\`\n${content}\n\`\`\`\n`;
      })
      .join("\n---\n\n");

    try {
      const savePath = await save({
        filters: [{
          name: 'Text',
          extensions: ['txt']
        }],
        defaultPath: 'project-export.txt'
      });

      if (savePath) {
        await invoke("write_file", { path: savePath, content: exportText });
      }
    } catch (err) {
      console.error("Export failed:", err);
    }
  }, [selectedFiles, fileContents]);

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
        setFileContents(new Map());
      } catch (err) {
        console.error("Failed to open folder:", err);
      } finally {
        setIsScanning(false);
      }
    }
  }, []);

  const handleExpandFolder = useCallback(async (path: string) => {
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

  const allContent = Array.from(selectedFiles)
    .map(path => {
      const content = fileContents.get(path) ?? "";
      const name = path.split(/[/\\]/).pop() ?? path;
      return `\`${name}\`\n\`\`\`\n${content}\n\`\`\``;
    })
    .join("\n\n");

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
      <SidebarInset className="flex flex-col">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b px-4 bg-background z-10">
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
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <textarea
              className="flex-1 w-full h-full p-4 font-mono text-sm bg-transparent border-none outline-none resize-none overflow-auto"
              value={allContent}
              readOnly
              placeholder="Select files from the sidebar to view their contents..."
            />
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;