import * as React from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  FileIcon,
  FileCodeIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  ClipboardCopyIcon,
  FolderOpen,
  FolderSyncIcon,
  Loader2Icon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileNode } from "@/types/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  folderPath: string | null;
  onOpenFolder: () => void;
  onChangeFolder: () => void;
  selectedFiles: Set<string>;
  onToggleFile: (path: string) => void;
  onExport: () => void;
  fileTree: FileNode[];
  onExpandFolder: (path: string) => void;
  isScanning: boolean;
}

export const AppSidebar = React.memo(({
  folderPath,
  onOpenFolder,
  onChangeFolder,
  selectedFiles,
  onToggleFile,
  onExport,
  fileTree,
  onExpandFolder,
  isScanning,
  ...props
}: AppSidebarProps) => {
  const selectedCount = selectedFiles.size
  const isFolderOpened = !!folderPath

  return (
    <Sidebar {...props}>
      {isFolderOpened && (
        <SidebarHeader className="border-b border-border px-3 py-2 gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground truncate">
              {folderPath?.split("/").pop() ?? "Project"}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-sm" onClick={onChangeFolder}>
                  <FolderSyncIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change folder</TooltipContent>
            </Tooltip>
          </div>
          {isScanning && (
            <Progress value={undefined} className="h-0.5" />
          )}
        </SidebarHeader>
      )}
      <SidebarContent>
        {!isFolderOpened ? (
          <SidebarGroup>
            <SidebarGroupLabel>No Folder Opened</SidebarGroupLabel>
            <SidebarGroupContent>
              <Button
                className="w-full"
                onClick={onOpenFolder}
                disabled={isScanning}
              >
                {isScanning ? <Loader2Icon className="animate-spin" /> : <FolderOpen data-icon="inline-start" />}
                Open folder
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {fileTree.map((node) => (
                  <TreeNode
                    key={node.path}
                    node={node}
                    selectedFiles={selectedFiles}
                    onToggleFile={onToggleFile}
                    onExpand={onExpandFolder}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 gap-2">
        {selectedCount > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">Selected</span>
            <Badge variant="secondary" className="text-xs">
              {selectedCount} {selectedCount === 1 ? "file" : "files"}
            </Badge>
          </div>
        )}
        <Button
          className="w-full"
          size="lg"
          disabled={selectedCount === 0}
          onClick={onExport}
        >
          <ClipboardCopyIcon data-icon="inline-start" />
          Export .txt
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
})

function getFileIcon(name: string) {
  const ext = name.split(".").pop()
  const codeExts = ["ts", "tsx", "rs", "js", "jsx", "css", "json", "toml"]
  return codeExts.includes(ext ?? "") ? (
    <FileCodeIcon className="size-3.5 text-muted-foreground" />
  ) : (
    <FileIcon className="size-3.5 text-muted-foreground" />
  )
}

const TreeNode = React.memo(({
  node,
  selectedFiles,
  onToggleFile,
  onExpand,
}: {
  node: FileNode;
  selectedFiles: Set<string>;
  onToggleFile: (path: string) => void;
  onExpand: (path: string) => void;
}) => {
  if (!node.is_dir) {
    const isSelected = selectedFiles.has(node.path);
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => onToggleFile(node.path)}
          className={cn(
            "hover:bg-muted",
            isSelected && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {getFileIcon(node.name)}
          <span className="truncate text-xs">{node.name}</span>
          {isSelected && <span className="ml-auto text-primary text-xs">✓</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const handleOpenChange = (open: boolean) => {
    if (open && !node.children && !node.loading) {
      onExpand(node.path);
    }
  };

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        onOpenChange={handleOpenChange}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="hover:bg-muted">
            <ChevronRightIcon className="size-3.5 transition-transform text-muted-foreground" />
            {node.loading ? (
              <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <FolderIcon className="size-3.5 text-muted-foreground group-data-[state=open]/collapsible:hidden" />
                <FolderOpenIcon className="size-3.5 text-muted-foreground hidden group-data-[state=open]/collapsible:block" />
              </>
            )}
            <span className="truncate text-xs font-medium">{node.name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {node.children?.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                selectedFiles={selectedFiles}
                onToggleFile={onToggleFile}
                onExpand={onExpand}
              />
            ))}
            {!node.children && node.loading && (
              <div className="px-2 py-1">
                <Progress value={undefined} className="h-0.5" />
              </div>
            )}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
})