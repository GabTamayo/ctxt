use ignore::WalkBuilder;
use serde::Serialize;

#[derive(Serialize)]
struct FileNode {
    name: String,
    path: String,
    is_dir: bool,
}

#[tauri::command]
async fn walk_directory(path: String) -> Result<Vec<FileNode>, String> {
    let mut nodes: Vec<FileNode> = Vec::new();

    let walker = WalkBuilder::new(&path)
        .max_depth(Some(1))
        .hidden(false)
        .build();

    for result in walker {
        let entry = result.map_err(|e| e.to_string())?;
        
        // entry.depth() == 0 is always the root path we passed in
        if entry.depth() == 0 {
            continue;
        }

        let entry_path = entry.path();
        let name = entry_path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let absolute_path = entry_path.to_string_lossy().to_string();
        let is_dir = entry_path.is_dir();

        nodes.push(FileNode {
            name,
            path: absolute_path,
            is_dir,
        });
    }

    nodes.sort_by(|a, b| b.is_dir.cmp(&a.is_dir).then(a.name.cmp(&b.name)));

    Ok(nodes)
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![walk_directory, read_file, write_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
