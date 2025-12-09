# ZenCode AI - Enterprise VS Code IDE

[![GitHub License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/kranthikiran885366/vscode?style=flat-square)](https://github.com/kranthikiran885366/vscode)
[![GitHub Issues](https://img.shields.io/github/issues/kranthikiran885366/vscode?style=flat-square)](https://github.com/kranthikiran885366/vscode/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/kranthikiran885366/vscode?style=flat-square)](https://github.com/kranthikiran885366/vscode/pulls)

A **production-ready, enterprise-grade web-based VS Code IDE** with 40+ advanced features. Build, debug, and collaborate on code directly in your browser.

## 🌟 Features

### 🎨 Advanced Code Editing
- **Monaco Editor** - Same editor as VS Code with 100+ language support
- **Syntax Highlighting** - Real-time highlighting for all major languages
- **IntelliSense** - Smart code completion with language support
- **Code Formatting** - Prettier, ESLint, Google, and Airbnb presets
- **Multi-Cursor Editing** - Edit multiple locations simultaneously
- **Code Folding** - Intelligent code folding with visual guides
- **Minimap** - Visual navigation of your code

### 🐛 Debugging & Execution
- **Advanced Debugger** - Breakpoints, watch expressions, and call stack inspection
- **Multiple Run Configs** - Node.js, Python, NPM, and custom configurations
- **Variable Inspector** - Inspect variables during debug sessions
- **Terminal Integration** - Built-in terminal with 15+ commands
- **Conditional Breakpoints** - Stop execution based on custom conditions

### 🔀 Git Integration
- **Branch Management** - Create, switch, and delete branches
- **Commit & Push** - Full commit workflow with message editor
- **File Staging** - Stage/unstage files for commits
- **Diff Viewer** - Side-by-side file comparison
- **Merge Support** - Built-in conflict resolution

### 🎯 Developer Tools
- **Code Snippets** - 8+ pre-built snippets + custom snippet creation
- **Code Outline** - Navigate code structure with symbol tree
- **Search & Replace** - Multi-file search with regex support
- **Problems Panel** - Aggregated error and warning display
- **Extensions Marketplace** - 40+ pre-configured extensions

### 🎨 Customization
- **6+ Built-in Themes** - Dark, Light, Nord, Dracula, Solarized, High Contrast
- **Custom Themes** - Create your own color schemes
- **Zen Mode** - Distraction-free editing experience
- **Keyboard Shortcuts** - 50+ VS Code keybindings
- **Settings Panel** - Customize editor behavior

### 🚀 Enterprise Features
- **Multi-tenancy** - Organization and team management
- **Billing Integration** - Subscription and payment management
- **Team Collaboration** - Real-time WebSocket collaboration
- **API Management** - Generate and manage API tokens
- **Security Settings** - Advanced authentication and authorization
- **Analytics Dashboard** - Track usage and performance metrics

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- npm or pnpm package manager
- Git ([Download](https://git-scm.com/))
- MongoDB (for database - optional if using cloud)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/kranthikiran885366/vscode.git
cd vscode
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Start the development server**
```bash
npm run dev
# or
pnpm dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 💻 Usage

### Access the IDE
1. Navigate to `http://localhost:3000/auth/signup`
2. Create a new account
3. Create a new project
4. Open the project in the enhanced editor at `/editor-enhanced?projectId=<PROJECT_ID>`

### Common Tasks

**Create a New File**
```
Left Panel → File Explorer → Click "+" → Enter filename
```

**Format Code**
```
Menu → Edit → Format Document
or Ctrl+Shift+I / ⌘⇧I
```

**Debug Code**
```
1. Set breakpoint by clicking line number
2. Press F5 or click "Debug" button
3. Use step controls to navigate
```

**Search Across Files**
```
Ctrl+Shift+F / ⌘⇧F → Enter search term
```

**Commit Changes**
```
Left Panel → Git → Enter message → Click Commit
```

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `⌘S` | Save file |
| `Ctrl+Shift+P` / `⌘⇧P` | Command palette |
| `Ctrl+Shift+E` / `⌘⇧E` | Explorer |
| `Ctrl+Shift+F` / `⌘⇧F` | Search |
| `Ctrl+Shift+G` / `⌃⇧G` | Git |
| `Ctrl+`` / `⌃`` | Terminal |
| `Ctrl+K Z` / `⌘K Z` | Zen mode |
| `F5` | Start debug |
| `F10` | Step over |
| `F11` | Step into |

## 📚 Documentation

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Local development setup guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design and architecture
- **[API.md](API.md)** - Backend API documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and releases
- **[FEATURES_IMPLEMENTED.md](FEATURES_IMPLEMENTED.md)** - Complete feature list

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13+
- **UI Library**: React 18+
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Icons**: Lucide React
- **Language**: TypeScript

### Backend (Required)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: MongoDB + PostgreSQL
- **Code Execution**: Docker/Sandbox

## 📊 Project Statistics

- **40+** Enterprise Features
- **6000+** Lines of Code
- **100+** Supported Languages
- **6** Built-in Themes
- **50+** Keyboard Shortcuts
- **15+** Terminal Commands
- **8+** Code Snippets
- **40+** Extensions

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to:

- Report bugs
- Suggest features
- Submit pull requests
- Set up development environment

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Environment details

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/kranthikiran885366/vscode/issues)
- **Discussions**: [GitHub Discussions](https://github.com/kranthikiran885366/vscode/discussions)
- **Email**: support@zencode.ai

## 🔐 Security

Please report security vulnerabilities responsibly. See [SECURITY.md](.github/SECURITY.md) for details.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://github.com/microsoft/monaco-editor) - Code editor
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://www.radix-ui.com/) - Component library
- [Socket.IO](https://socket.io/) - Real-time communication

## 📈 Roadmap

- [ ] Live Share for real-time collaboration
- [ ] Remote development (SSH, WSL, Docker)
- [ ] Notebook support (Jupyter-like)
- [ ] AI-powered code generation
- [ ] Performance profiler
- [ ] Multi-workspace support
- [ ] Cloud sync for settings
- [ ] Team comments and code review

## 🌟 Show Your Support

Give us a ⭐ if this project helped you! Your support motivates us to keep improving.

---

**Built with ❤️ by the ZenCode AI Team**

[Website](https://zencode.ai) • [Twitter](https://twitter.com/zencode_ai) • [Email](mailto:support@zencode.ai)
