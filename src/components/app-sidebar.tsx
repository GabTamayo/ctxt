"use client"

import * as React from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileIcon,
  FileCodeIcon,
  ChevronRightIcon,
  FolderIcon,
  FolderOpenIcon,
  ClipboardCopyIcon,
  FolderOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

//! Mock data — replace with real invoke() later
const data = {
  tree: [
    ["src", "App.tsx", "main.tsx", "index.css"],
    ["src-tauri", ["src", "lib.rs", "main.rs"]],
    "package.json",
    "tsconfig.json",
  ],
}

type TreeItem = string | TreeItem[]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isFolderOpened: boolean
  onOpenFolder: () => void
  selectedFiles: Set<string>
  onToggleFile: (path: string) => void
  onExport: () => void
}

export function AppSidebar({
  isFolderOpened,
  onOpenFolder,
  selectedFiles,
  onToggleFile,
  onExport,
  ...props
}: AppSidebarProps) {
  const selectedCount = selectedFiles.size

  return (
    <Sidebar {...props}>
      <SidebarContent>
        {!isFolderOpened ? (
          <SidebarGroup>
            <SidebarGroupLabel>No Folder Opened</SidebarGroupLabel>
            <SidebarGroupContent>
              <Button
                className="w-full"
                onClick={onOpenFolder}
              >
                <FolderOpen data-icon="inline-start" />
                Open folder
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Files</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.tree.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    path=""
                    selectedFiles={selectedFiles}
                    onToggleFile={onToggleFile}
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
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()
  const codeExts = ["ts", "tsx", "rs", "js", "jsx", "css", "json", "toml"]
  return codeExts.includes(ext ?? "") ? (
    <FileCodeIcon className="size-3.5 text-muted-foreground" />
  ) : (
    <FileIcon className="size-3.5 text-muted-foreground" />
  )
}

function Tree({
  item,
  path,
  selectedFiles,
  onToggleFile,
}: {
  item: TreeItem
  path: string
  selectedFiles: Set<string>
  onToggleFile: (path: string) => void
}) {
  const [name, ...items] = Array.isArray(item) ? item : [item]
  const fullPath = path ? `${path}/${name}` : String(name)

  // File
  if (!items.length) {
    const isSelected = selectedFiles.has(fullPath)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => onToggleFile(fullPath)}
          className={cn(
            "hover:bg-muted",
            isSelected && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {getFileIcon(String(name))}
          <span className="truncate text-xs">{String(name)}</span>
          {isSelected && <span className="ml-auto text-primary text-xs">✓</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  // Folder
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="hover:bg-muted">
            <ChevronRightIcon className="size-3.5 transition-transform text-muted-foreground" />
            <FolderIcon className="size-3.5 text-muted-foreground group-data-[state=open]/collapsible:hidden" />
            <FolderOpenIcon className="size-3.5 text-muted-foreground hidden group-data-[state=open]/collapsible:block" />
            <span className="truncate text-xs font-medium">{String(name)}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem as TreeItem}
                path={fullPath}
                selectedFiles={selectedFiles}
                onToggleFile={onToggleFile}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}