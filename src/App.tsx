import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
          <h1 className="text-4xl tracking-wide">Welcome to ctx</h1>

          <div className="flex gap-2 w-full max-w-sm">
            <Input
              placeholder="Enter a name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && greet()}
            />
            <Button onClick={greet}>Greet</Button>
          </div>

          {greetMsg && <p className="text-sm">{greetMsg}</p>}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
