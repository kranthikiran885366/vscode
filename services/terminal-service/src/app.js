
const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const pty = require("node-pty")
const os = require("os")
const path = require("path")

const { authenticateSocket } = require("./middleware/socketAuth")
const logger = require("./utils/logger")

const app = express()
const server = http.createServer(app)

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Store active terminal sessions
const terminals = new Map()
const userSockets = new Map()

// Middleware
app.use(express.json())

// Socket.IO middleware
io.use(authenticateSocket)

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.info(`User connected to terminal: ${socket.userId} (${socket.id})`)
  
  userSockets.set(socket.userId, socket)

  // Create new terminal session
  socket.on("create-terminal", (data) => {
    try {
      const { projectId, workingDir = "/tmp" } = data
      const terminalId = `${socket.userId}-${Date.now()}`

      // Create new pty process
      const shell = os.platform() === "win32" ? "powershell.exe" : "bash"
      const ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: data.cols || 80,
        rows: data.rows || 24,
        cwd: workingDir,
        env: {
          ...process.env,
          TERM: "xterm-256color",
          COLORTERM: "truecolor",
        },
      })

      // Store terminal session
      terminals.set(terminalId, {
        ptyProcess,
        userId: socket.userId,
        projectId,
        createdAt: new Date(),
        lastActivity: new Date(),
      })

      // Handle pty output
      ptyProcess.on("data", (data) => {
        socket.emit("terminal-output", {
          terminalId,
          data: data.toString(),
        })
        
        // Update last activity
        const terminal = terminals.get(terminalId)
        if (terminal) {
          terminal.lastActivity = new Date()
        }
      })

      // Handle pty exit
      ptyProcess.on("exit", (code) => {
        socket.emit("terminal-exit", {
          terminalId,
          exitCode: code,
        })
        
        terminals.delete(terminalId)
        logger.info(`Terminal ${terminalId} exited with code ${code}`)
      })

      socket.emit("terminal-created", {
        terminalId,
        cols: ptyProcess.cols,
        rows: ptyProcess.rows,
      })

      logger.info(`Created terminal ${terminalId} for user ${socket.userId}`)
    } catch (error) {
      logger.error("Error creating terminal:", error)
      socket.emit("terminal-error", {
        message: "Failed to create terminal session",
      })
    }
  })

  // Handle terminal input
  socket.on("terminal-input", (data) => {
    try {
      const { terminalId, input } = data
      const terminal = terminals.get(terminalId)

      if (!terminal) {
        socket.emit("terminal-error", {
          message: "Terminal session not found",
        })
        return
      }

      if (terminal.userId !== socket.userId) {
        socket.emit("terminal-error", {
          message: "Access denied to terminal session",
        })
        return
      }

      terminal.ptyProcess.write(input)
      terminal.lastActivity = new Date()
    } catch (error) {
      logger.error("Error handling terminal input:", error)
      socket.emit("terminal-error", {
        message: "Failed to process terminal input",
      })
    }
  })

  // Resize terminal
  socket.on("terminal-resize", (data) => {
    try {
      const { terminalId, cols, rows } = data
      const terminal = terminals.get(terminalId)

      if (!terminal) {
        socket.emit("terminal-error", {
          message: "Terminal session not found",
        })
        return
      }

      if (terminal.userId !== socket.userId) {
        socket.emit("terminal-error", {
          message: "Access denied to terminal session",
        })
        return
      }

      terminal.ptyProcess.resize(cols, rows)
      terminal.lastActivity = new Date()
    } catch (error) {
      logger.error("Error resizing terminal:", error)
      socket.emit("terminal-error", {
        message: "Failed to resize terminal",
      })
    }
  })

  // Kill terminal session
  socket.on("kill-terminal", (data) => {
    try {
      const { terminalId } = data
      const terminal = terminals.get(terminalId)

      if (!terminal) {
        socket.emit("terminal-error", {
          message: "Terminal session not found",
        })
        return
      }

      if (terminal.userId !== socket.userId) {
        socket.emit("terminal-error", {
          message: "Access denied to terminal session",
        })
        return
      }

      terminal.ptyProcess.kill()
      terminals.delete(terminalId)

      socket.emit("terminal-killed", { terminalId })
      logger.info(`Killed terminal ${terminalId}`)
    } catch (error) {
      logger.error("Error killing terminal:", error)
      socket.emit("terminal-error", {
        message: "Failed to kill terminal session",
      })
    }
  })

  // List user's terminal sessions
  socket.on("list-terminals", () => {
    try {
      const userTerminals = []
      
      for (const [terminalId, terminal] of terminals.entries()) {
        if (terminal.userId === socket.userId) {
          userTerminals.push({
            terminalId,
            projectId: terminal.projectId,
            createdAt: terminal.createdAt,
            lastActivity: terminal.lastActivity,
            cols: terminal.ptyProcess.cols,
            rows: terminal.ptyProcess.rows,
          })
        }
      }

      socket.emit("terminals-list", { terminals: userTerminals })
    } catch (error) {
      logger.error("Error listing terminals:", error)
      socket.emit("terminal-error", {
        message: "Failed to list terminal sessions",
      })
    }
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    logger.info(`User disconnected from terminal: ${socket.userId} (${socket.id})`)
    
    userSockets.delete(socket.userId)

    // Clean up user's terminal sessions after a delay
    setTimeout(() => {
      const userStillConnected = userSockets.has(socket.userId)
      
      if (!userStillConnected) {
        for (const [terminalId, terminal] of terminals.entries()) {
          if (terminal.userId === socket.userId) {
            terminal.ptyProcess.kill()
            terminals.delete(terminalId)
            logger.info(`Cleaned up terminal ${terminalId} for disconnected user`)
          }
        }
      }
    }, 30000) // 30 second grace period
  })
})

// REST API endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "terminal-service",
    activeTerminals: terminals.size,
    connectedUsers: userSockets.size,
    timestamp: new Date().toISOString(),
  })
})

// Get terminal statistics
app.get("/api/terminals/stats", (req, res) => {
  try {
    const stats = {
      totalTerminals: terminals.size,
      connectedUsers: userSockets.size,
      terminalsByUser: {},
    }

    for (const [terminalId, terminal] of terminals.entries()) {
      if (!stats.terminalsByUser[terminal.userId]) {
        stats.terminalsByUser[terminal.userId] = 0
      }
      stats.terminalsByUser[terminal.userId]++
    }

    res.json(stats)
  } catch (error) {
    logger.error("Error getting terminal stats:", error)
    res.status(500).json({ error: "Failed to get terminal statistics" })
  }
})

// Periodic cleanup of inactive terminals
setInterval(() => {
  const now = new Date()
  const inactiveThreshold = 30 * 60 * 1000 // 30 minutes

  for (const [terminalId, terminal] of terminals.entries()) {
    if (now - terminal.lastActivity > inactiveThreshold) {
      terminal.ptyProcess.kill()
      terminals.delete(terminalId)
      logger.info(`Cleaned up inactive terminal: ${terminalId}`)
    }
  }
}, 5 * 60 * 1000) // Run every 5 minutes

const PORT = process.env.PORT || 3004

server.listen(PORT, () => {
  logger.info(`Terminal service running on port ${PORT}`)
})

module.exports = app
