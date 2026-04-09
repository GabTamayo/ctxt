import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-bold">Welcome to ctx</h1>

      <div className="flex gap-2 w-full max-w-sm">
        <Input
          placeholder="Enter a name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && greet()}
        />
        <Button onClick={greet}>Greet</Button>
      </div>

      {greetMsg && (
        <p className="text-sm text-muted-foreground">{greetMsg}</p>
      )}
    </main>
  );
}

export default App;
