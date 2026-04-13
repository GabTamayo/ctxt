# ctxt 📝

**ctxt** is a lightweight, cross-platform desktop application built with Tauri, React, and Rust. It's designed to streamline the process of gathering source code from your projects and preparing it for AI web chats (like ChatGPT, Claude, or Gemini).

Instead of manually copy-pasting individual files, **ctxt** allows you to browse your project, select exactly what you need, and export it all into a single, well-formatted text file.

## ✨ Features

- 📂 **Incremental Folder Walking**: Quickly browse through large projects with lazy-loading directory trees.
- ✅ **Selective Selection**: Pick only the files relevant to your current AI prompt.
- 🔍 **Live Preview**: See exactly how your code will be formatted before you export.
- 📄 **Standardized Output**: Automatically wraps code in markdown blocks with filenames for better AI context.
- 🚀 **Built for Speed**: Powered by Rust on the backend for fast file system operations and React 19 for a smooth UI.
- 🎨 **Modern Interface**: Clean UI built with Tailwind CSS 4 and shadcn/ui.

## 🛠️ Tech Stack

- **Framework**: [Tauri v2](https://tauri.app/)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Rust](https://www.rust-lang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [Rust](https://www.rust-lang.org/tools/install)
- Platform-specific dependencies for Tauri (see [Tauri's setup guide](https://tauri.app/v1/guides/getting-started/prerequisites))

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ctxt.git
   cd ctxt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app in development mode:
   ```bash
   npm run tauri dev
   ```

### Building for Production

To create a production-ready bundle for your OS:

```bash
npm run tauri build
```

The installer will be located in `src-tauri/target/release/bundle/`.

## 📖 How to Use

1. **Open Folder**: Click the "Open folder" button and select your project directory.
2. **Select Files**: Use the sidebar to navigate and check the files you want to include.
3. **Preview**: The main area displays the combined content of all selected files.
4. **Export**: Click "Export .txt" to save the formatted content to a file, ready to be dropped into an AI chat.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve **ctxt**.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
