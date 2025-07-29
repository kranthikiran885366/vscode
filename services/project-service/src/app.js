
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const mongoose = require("mongoose")
const multer = require("multer")
const path = require("path")
const fs = require("fs").promises

const { authenticateToken } = require("./middleware/auth")
const Project = require("./models/Project")
const File = require("./models/File")
const logger = require("./utils/logger")

const app = express()

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/codeplatform")

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const projectPath = path.join(__dirname, "../data/projects", req.params.projectId)
    await fs.mkdir(projectPath, { recursive: true })
    cb(null, projectPath)
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
})

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "project-service",
    timestamp: new Date().toISOString(),
  })
})

// Get all projects for user
app.get("/api/projects", authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ 
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).populate("owner", "username email")

    res.json(projects)
  } catch (error) {
    logger.error("Error fetching projects:", error)
    res.status(500).json({ error: "Failed to fetch projects" })
  }
})

// Create new project
app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { name, description, template, language } = req.body

    const project = new Project({
      name,
      description,
      template,
      language,
      owner: req.user.id,
      settings: {
        public: false,
        autoSave: true,
        theme: "dark",
      },
    })

    await project.save()

    // Create project directory
    const projectPath = path.join(__dirname, "../data/projects", project._id.toString())
    await fs.mkdir(projectPath, { recursive: true })

    // Create initial files based on template
    await createTemplateFiles(project._id, template, language)

    res.status(201).json(project)
  } catch (error) {
    logger.error("Error creating project:", error)
    res.status(500).json({ error: "Failed to create project" })
  }
})

// Get project details
app.get("/api/projects/:id", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "username email")
      .populate("collaborators", "username email")

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    // Check access permissions
    if (!hasProjectAccess(project, req.user.id)) {
      return res.status(403).json({ error: "Access denied" })
    }

    res.json(project)
  } catch (error) {
    logger.error("Error fetching project:", error)
    res.status(500).json({ error: "Failed to fetch project" })
  }
})

// Get project file tree
app.get("/api/projects/:id/files", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project || !hasProjectAccess(project, req.user.id)) {
      return res.status(404).json({ error: "Project not found" })
    }

    const projectPath = path.join(__dirname, "../data/projects", req.params.id)
    const fileTree = await buildFileTree(projectPath)

    res.json(fileTree)
  } catch (error) {
    logger.error("Error fetching file tree:", error)
    res.status(500).json({ error: "Failed to fetch file tree" })
  }
})

// Get file content
app.get("/api/projects/:id/files/*", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project || !hasProjectAccess(project, req.user.id)) {
      return res.status(404).json({ error: "Project not found" })
    }

    const filePath = req.params[0]
    const fullPath = path.join(__dirname, "../data/projects", req.params.id, filePath)

    const content = await fs.readFile(fullPath, "utf-8")
    const stats = await fs.stat(fullPath)

    res.json({
      content,
      size: stats.size,
      modified: stats.mtime,
      language: getLanguageFromExtension(path.extname(filePath)),
    })
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "File not found" })
    }
    logger.error("Error reading file:", error)
    res.status(500).json({ error: "Failed to read file" })
  }
})

// Save file content
app.put("/api/projects/:id/files/*", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project || !hasProjectAccess(project, req.user.id)) {
      return res.status(404).json({ error: "Project not found" })
    }

    const filePath = req.params[0]
    const fullPath = path.join(__dirname, "../data/projects", req.params.id, filePath)
    const { content } = req.body

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    
    await fs.writeFile(fullPath, content, "utf-8")
    
    // Update project modified time
    project.lastModified = new Date()
    await project.save()

    res.json({ success: true })
  } catch (error) {
    logger.error("Error saving file:", error)
    res.status(500).json({ error: "Failed to save file" })
  }
})

// Create new file/folder
app.post("/api/projects/:id/files", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project || !hasProjectAccess(project, req.user.id)) {
      return res.status(404).json({ error: "Project not found" })
    }

    const { path: filePath, type, content = "" } = req.body
    const fullPath = path.join(__dirname, "../data/projects", req.params.id, filePath)

    if (type === "folder") {
      await fs.mkdir(fullPath, { recursive: true })
    } else {
      await fs.mkdir(path.dirname(fullPath), { recursive: true })
      await fs.writeFile(fullPath, content, "utf-8")
    }

    project.lastModified = new Date()
    await project.save()

    res.json({ success: true })
  } catch (error) {
    logger.error("Error creating file/folder:", error)
    res.status(500).json({ error: "Failed to create file/folder" })
  }
})

// Delete file/folder
app.delete("/api/projects/:id/files/*", authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project || !hasProjectAccess(project, req.user.id)) {
      return res.status(404).json({ error: "Project not found" })
    }

    const filePath = req.params[0]
    const fullPath = path.join(__dirname, "../data/projects", req.params.id, filePath)

    const stats = await fs.stat(fullPath)
    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true })
    } else {
      await fs.unlink(fullPath)
    }

    project.lastModified = new Date()
    await project.save()

    res.json({ success: true })
  } catch (error) {
    logger.error("Error deleting file/folder:", error)
    res.status(500).json({ error: "Failed to delete file/folder" })
  }
})

// Upload files
app.post("/api/projects/:id/upload", authenticateToken, upload.array("files"), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project || !hasProjectAccess(project, req.user.id)) {
      return res.status(404).json({ error: "Project not found" })
    }

    project.lastModified = new Date()
    await project.save()

    res.json({ 
      success: true, 
      files: req.files.map(f => ({ name: f.filename, size: f.size }))
    })
  } catch (error) {
    logger.error("Error uploading files:", error)
    res.status(500).json({ error: "Failed to upload files" })
  }
})

// Helper functions
function hasProjectAccess(project, userId) {
  return project.owner.toString() === userId || 
         project.collaborators.includes(userId) ||
         project.settings.public
}

async function buildFileTree(dirPath, relativePath = "") {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    const tree = []

    for (const item of items) {
      const itemPath = path.join(dirPath, item.name)
      const relativeItemPath = path.join(relativePath, item.name)

      if (item.isDirectory()) {
        const children = await buildFileTree(itemPath, relativeItemPath)
        tree.push({
          name: item.name,
          path: relativeItemPath,
          type: "folder",
          children,
        })
      } else {
        const stats = await fs.stat(itemPath)
        tree.push({
          name: item.name,
          path: relativeItemPath,
          type: "file",
          size: stats.size,
          modified: stats.mtime,
          language: getLanguageFromExtension(path.extname(item.name)),
        })
      }
    }

    return tree.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    return []
  }
}

function getLanguageFromExtension(ext) {
  const langMap = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".cs": "csharp",
    ".php": "php",
    ".rb": "ruby",
    ".go": "go",
    ".rs": "rust",
    ".html": "html",
    ".css": "css",
    ".scss": "scss",
    ".sass": "sass",
    ".json": "json",
    ".xml": "xml",
    ".md": "markdown",
    ".sql": "sql",
    ".sh": "bash",
    ".yaml": "yaml",
    ".yml": "yaml",
  }
  return langMap[ext.toLowerCase()] || "plaintext"
}

async function createTemplateFiles(projectId, template, language) {
  const projectPath = path.join(__dirname, "../data/projects", projectId.toString())
  
  const templates = {
    "react": {
      "package.json": JSON.stringify({
        name: "react-app",
        version: "1.0.0",
        dependencies: {
          react: "^18.0.0",
          "react-dom": "^18.0.0"
        },
        scripts: {
          start: "react-scripts start",
          build: "react-scripts build"
        }
      }, null, 2),
      "src/App.js": `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Hello World!</h1>
    </div>
  );
}

export default App;`,
      "src/index.js": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`,
      "public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`
    },
    "node": {
      "package.json": JSON.stringify({
        name: "node-app",
        version: "1.0.0",
        main: "index.js",
        scripts: {
          start: "node index.js"
        }
      }, null, 2),
      "index.js": `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
});`
    },
    "python": {
      "main.py": `def main():
    print("Hello World!")

if __name__ == "__main__":
    main()`,
      "requirements.txt": ""
    }
  }

  const templateFiles = templates[template] || templates["node"]
  
  for (const [filePath, content] of Object.entries(templateFiles)) {
    const fullPath = path.join(projectPath, filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, content, "utf-8")
  }
}

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  logger.info(`Project service running on port ${PORT}`)
})

module.exports = app
