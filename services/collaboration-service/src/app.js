const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const redis = require("redis")
const mongoose = require("mongoose")

const { authenticateSocket } = require("./middleware/socketAuth")
const CollaborationRoom = require("./models/CollaborationRoom")
const logger = require("./utils/logger")

const app = express()
const server = http.createServer(app)

// Redis client for pub/sub
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

const redisSubscriber = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
})

redisClient.connect()
redisSubscriber.connect()

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
})

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/codeplatform")

// Middleware
app.use(cors())
app.use(express.json())

// Store active rooms and users
const activeRooms = new Map()
const userSockets = new Map()

// Socket.IO middleware
io.use(authenticateSocket)

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.userId} (${socket.id})`)

  // Store user socket mapping
  userSockets.set(socket.userId, socket)

  // Handle joining a collaboration room
  socket.on("join-room", async (data) => {
    try {
      const { roomId, projectId } = data

      // Leave previous rooms
      Array.from(socket.rooms).forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })

      // Join new room
      socket.join(roomId)
      socket.currentRoom = roomId
      socket.projectId = projectId

      // Get or create room data
      let room = activeRooms.get(roomId)
      if (!room) {
        room = {
          id: roomId,
          projectId: projectId,
          users: new Map(),
          cursors: new Map(),
          selections: new Map(),
          lastActivity: Date.now(),
          documentState: null,
        }
        activeRooms.set(roomId, room)
      }

      // Add user to room
      room.users.set(socket.userId, {
        id: socket.userId,
        username: socket.username,
        avatar: socket.avatar,
        joinedAt: Date.now(),
        isActive: true,
      })

      // Notify other users in the room
      socket.to(roomId).emit("user-joined", {
        user: {
          id: socket.userId,
          username: socket.username,
          avatar: socket.avatar,
        },
        timestamp: Date.now(),
      })

      // Send current room state to the joining user
      socket.emit("room-state", {
        users: Array.from(room.users.values()),
        cursors: Object.fromEntries(room.cursors),
        selections: Object.fromEntries(room.selections),
        documentState: room.documentState,
      })

      // Update room in database
      await updateRoomInDatabase(roomId, room)

      logger.info(`User ${socket.userId} joined room ${roomId}`)
    } catch (error) {
      logger.error("Error joining room:", error)
      socket.emit("error", { message: "Failed to join room" })
    }
  })

  // Handle leaving a room
  socket.on("leave-room", async () => {
    if (socket.currentRoom) {
      await handleUserLeaveRoom(socket)
    }
  })

  // Handle document changes (operational transformation)
  socket.on("document-change", async (data) => {
    try {
      const { roomId, operation, documentId, version } = data

      if (socket.currentRoom !== roomId) {
        socket.emit("error", { message: "Not in the specified room" })
        return
      }

      const room = activeRooms.get(roomId)
      if (!room) {
        socket.emit("error", { message: "Room not found" })
        return
      }

      // Apply operational transformation
      const transformedOperation = await applyOperationalTransform(operation, room.documentState, version)

      // Update room document state
      room.documentState = applyOperation(room.documentState, transformedOperation)
      room.lastActivity = Date.now()

      // Broadcast to other users in the room
      socket.to(roomId).emit("document-change", {
        operation: transformedOperation,
        userId: socket.userId,
        username: socket.username,
        timestamp: Date.now(),
        version: room.documentState.version,
      })

      // Acknowledge the change to the sender
      socket.emit("operation-ack", {
        operationId: data.operationId,
        version: room.documentState.version,
      })

      // Persist changes to Redis for scalability
      await redisClient.publish(
        `room:${roomId}:changes`,
        JSON.stringify({
          operation: transformedOperation,
          userId: socket.userId,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      logger.error("Error handling document change:", error)
      socket.emit("error", { message: "Failed to process document change" })
    }
  })

  // Handle cursor position updates
  socket.on("cursor-position", (data) => {
    try {
      const { roomId, position, selection } = data

      if (socket.currentRoom !== roomId) return

      const room = activeRooms.get(roomId)
      if (!room) return

      // Update cursor position
      room.cursors.set(socket.userId, {
        userId: socket.userId,
        username: socket.username,
        position: position,
        timestamp: Date.now(),
      })

      // Update selection if provided
      if (selection) {
        room.selections.set(socket.userId, {
          userId: socket.userId,
          selection: selection,
          timestamp: Date.now(),
        })
      }

      // Broadcast to other users
      socket.to(roomId).emit("cursor-update", {
        userId: socket.userId,
        username: socket.username,
        position: position,
        selection: selection,
        timestamp: Date.now(),
      })
    } catch (error) {
      logger.error("Error handling cursor position:", error)
    }
  })

  // Handle chat messages
  socket.on("chat-message", async (data) => {
    try {
      const { roomId, message, type = "text" } = data

      if (socket.currentRoom !== roomId) {
        socket.emit("error", { message: "Not in the specified room" })
        return
      }

      const chatMessage = {
        id: generateId(),
        userId: socket.userId,
        username: socket.username,
        avatar: socket.avatar,
        message: message,
        type: type,
        timestamp: Date.now(),
      }

      // Broadcast to all users in the room (including sender)
      io.to(roomId).emit("chat-message", chatMessage)

      // Store message in database
      await storeChatMessage(roomId, chatMessage)
    } catch (error) {
      logger.error("Error handling chat message:", error)
      socket.emit("error", { message: "Failed to send message" })
    }
  })

  // Handle code execution requests
  socket.on("execute-code", async (data) => {
    try {
      const { roomId, code, language, input } = data

      if (socket.currentRoom !== roomId) {
        socket.emit("error", { message: "Not in the specified room" })
        return
      }

      // Notify room that execution is starting
      io.to(roomId).emit("execution-started", {
        userId: socket.userId,
        username: socket.username,
        language: language,
        timestamp: Date.now(),
      })

      // Forward to execution service (this would be an HTTP call in production)
      const executionResult = await executeCodeRemotely(code, language, input)

      // Broadcast results to room
      io.to(roomId).emit("execution-result", {
        userId: socket.userId,
        username: socket.username,
        result: executionResult,
        timestamp: Date.now(),
      })
    } catch (error) {
      logger.error("Error handling code execution:", error)
      socket.emit("error", { message: "Code execution failed" })
    }
  })

  // Handle terminal sharing
  socket.on("terminal-input", (data) => {
    try {
      const { roomId, input, terminalId } = data

      if (socket.currentRoom !== roomId) return

      // Broadcast terminal input to other users
      socket.to(roomId).emit("terminal-input", {
        userId: socket.userId,
        username: socket.username,
        input: input,
        terminalId: terminalId,
        timestamp: Date.now(),
      })
    } catch (error) {
      logger.error("Error handling terminal input:", error)
    }
  })

  // Handle file operations
  socket.on("file-operation", async (data) => {
    try {
      const { roomId, operation, path, content, type } = data

      if (socket.currentRoom !== roomId) {
        socket.emit("error", { message: "Not in the specified room" })
        return
      }

      // Broadcast file operation to other users
      socket.to(roomId).emit("file-operation", {
        userId: socket.userId,
        username: socket.username,
        operation: operation,
        path: path,
        content: content,
        type: type,
        timestamp: Date.now(),
      })

      // Update room activity
      const room = activeRooms.get(roomId)
      if (room) {
        room.lastActivity = Date.now()
      }
    } catch (error) {
      logger.error("Error handling file operation:", error)
      socket.emit("error", { message: "File operation failed" })
    }
  })

  // Handle voice/video call signaling
  socket.on("call-signal", (data) => {
    try {
      const { roomId, targetUserId, signal, type } = data

      if (socket.currentRoom !== roomId) return

      const targetSocket = userSockets.get(targetUserId)
      if (targetSocket && targetSocket.currentRoom === roomId) {
        targetSocket.emit("call-signal", {
          fromUserId: socket.userId,
          fromUsername: socket.username,
          signal: signal,
          type: type,
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      logger.error("Error handling call signal:", error)
    }
  })

  // Handle disconnect
  socket.on("disconnect", async () => {
    logger.info(`User disconnected: ${socket.userId} (${socket.id})`)

    // Remove from user sockets mapping
    userSockets.delete(socket.userId)

    // Handle leaving current room
    if (socket.currentRoom) {
      await handleUserLeaveRoom(socket)
    }
  })

  // Handle connection errors
  socket.on("error", (error) => {
    logger.error(`Socket error for user ${socket.userId}:`, error)
  })
})

// Helper functions
async function handleUserLeaveRoom(socket) {
  const roomId = socket.currentRoom
  const room = activeRooms.get(roomId)

  if (room) {
    // Remove user from room
    room.users.delete(socket.userId)
    room.cursors.delete(socket.userId)
    room.selections.delete(socket.userId)

    // Notify other users
    socket.to(roomId).emit("user-left", {
      userId: socket.userId,
      username: socket.username,
      timestamp: Date.now(),
    })

    // Clean up empty rooms
    if (room.users.size === 0) {
      activeRooms.delete(roomId)
      logger.info(`Cleaned up empty room: ${roomId}`)
    } else {
      // Update room in database
      await updateRoomInDatabase(roomId, room)
    }
  }

  socket.leave(roomId)
  socket.currentRoom = null
}

async function applyOperationalTransform(operation, documentState, version) {
  // Simplified operational transformation
  // In production, use a library like ShareJS or Yjs

  if (!documentState) {
    return operation
  }

  // Check version conflicts
  if (version < documentState.version) {
    // Transform operation against newer operations
    // This is a simplified implementation
    return {
      ...operation,
      index: Math.max(0, operation.index - (documentState.version - version)),
    }
  }

  return operation
}

function applyOperation(documentState, operation) {
  if (!documentState) {
    documentState = {
      content: "",
      version: 0,
    }
  }

  let newContent = documentState.content

  switch (operation.type) {
    case "insert":
      newContent = newContent.slice(0, operation.index) + operation.text + newContent.slice(operation.index)
      break

    case "delete":
      newContent = newContent.slice(0, operation.index) + newContent.slice(operation.index + operation.length)
      break

    case "replace":
      newContent =
        newContent.slice(0, operation.index) + operation.text + newContent.slice(operation.index + operation.length)
      break
  }

  return {
    content: newContent,
    version: documentState.version + 1,
    lastModified: Date.now(),
  }
}

async function updateRoomInDatabase(roomId, room) {
  try {
    await CollaborationRoom.findOneAndUpdate(
      { roomId: roomId },
      {
        roomId: roomId,
        projectId: room.projectId,
        activeUsers: Array.from(room.users.values()),
        lastActivity: room.lastActivity,
        documentState: room.documentState,
      },
      { upsert: true },
    )
  } catch (error) {
    logger.error("Error updating room in database:", error)
  }
}

async function storeChatMessage(roomId, message) {
  try {
    // Store in Redis for quick access
    await redisClient.lpush(`room:${roomId}:chat`, JSON.stringify(message))
    await redisClient.ltrim(`room:${roomId}:chat`, 0, 99) // Keep last 100 messages

    // Also store in MongoDB for persistence
    // Implementation would go here
  } catch (error) {
    logger.error("Error storing chat message:", error)
  }
}

async function executeCodeRemotely(code, language, input) {
  // This would make an HTTP request to the execution service
  // For now, return a mock result
  return {
    output: `Mock output for ${language} code execution`,
    error: null,
    executionTime: 0.5,
    exitCode: 0,
  }
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Redis subscription for cross-instance communication
redisSubscriber.subscribe("collaboration:*")
redisSubscriber.on("message", (channel, message) => {
  try {
    const data = JSON.parse(message)
    const roomId = channel.split(":")[1]

    // Broadcast to local room
    io.to(roomId).emit("external-update", data)
  } catch (error) {
    logger.error("Error handling Redis message:", error)
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "collaboration-service",
    activeRooms: activeRooms.size,
    connectedUsers: userSockets.size,
    timestamp: new Date().toISOString(),
  })
})

// API endpoints
app.get("/api/rooms/:roomId/users", async (req, res) => {
  try {
    const { roomId } = req.params
    const room = activeRooms.get(roomId)

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    res.json({
      users: Array.from(room.users.values()),
      count: room.users.size,
    })
  } catch (error) {
    logger.error("Error getting room users:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/rooms/:roomId/chat", async (req, res) => {
  try {
    const { roomId } = req.params
    const limit = Number.parseInt(req.query.limit) || 50

    // Get chat messages from Redis
    const messages = await redisClient.lrange(`room:${roomId}:chat`, 0, limit - 1)
    const parsedMessages = messages.map((msg) => JSON.parse(msg)).reverse()

    res.json({
      messages: parsedMessages,
      count: parsedMessages.length,
    })
  } catch (error) {
    logger.error("Error getting chat messages:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Periodic cleanup of inactive rooms
setInterval(
  () => {
    const now = Date.now()
    const inactiveThreshold = 30 * 60 * 1000 // 30 minutes

    for (const [roomId, room] of activeRooms.entries()) {
      if (now - room.lastActivity > inactiveThreshold && room.users.size === 0) {
        activeRooms.delete(roomId)
        logger.info(`Cleaned up inactive room: ${roomId}`)
      }
    }
  },
  5 * 60 * 1000,
) // Run every 5 minutes

const PORT = process.env.PORT || 3003

server.listen(PORT, () => {
  logger.info(`Collaboration service running on port ${PORT}`)
})

module.exports = app
