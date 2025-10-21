import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'

interface AuthenticatedSocket extends Socket {
  userId?: string
  email?: string
  projectId?: string
}

interface EditorUpdate {
  content: string
  fileId: string
  cursor?: { line: number; column: number }
  selection?: { start: number; end: number }
}

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Middleware for authentication
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
      socket.userId = decoded.id
      socket.email = decoded.email
      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  // Active connections per project
  const activeEditors = new Map<string, Set<string>>()
  const userCursors = new Map<string, Map<string, { line: number; column: number }>>()

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`✅ User ${socket.userId} connected: ${socket.id}`)

    // Join project room
    socket.on('join-project', (projectId: string) => {
      socket.projectId = projectId
      socket.join(`project-${projectId}`)

      if (!activeEditors.has(projectId)) {
        activeEditors.set(projectId, new Set())
      }
      activeEditors.get(projectId)!.add(socket.id)

      if (!userCursors.has(projectId)) {
        userCursors.set(projectId, new Map())
      }

      io.to(`project-${projectId}`).emit('user-joined', {
        userId: socket.userId,
        socketId: socket.id,
        activeUsers: Array.from(activeEditors.get(projectId) || []).length,
      })

      console.log(`User ${socket.userId} joined project ${projectId}`)
    })

    // Handle editor updates (real-time sync)
    socket.on('editor-update', (data: EditorUpdate) => {
      if (!socket.projectId) return

      const update = {
        ...data,
        userId: socket.userId,
        socketId: socket.id,
        timestamp: Date.now(),
      }

      // Broadcast to all other users in the project
      socket.to(`project-${socket.projectId}`).emit('editor-update', update)
    })

    // Handle cursor movements
    socket.on('cursor-move', (data: { line: number; column: number }) => {
      if (!socket.projectId) return

      const cursors = userCursors.get(socket.projectId) || new Map()
      cursors.set(socket.id, data)
      userCursors.set(socket.projectId, cursors)

      socket.to(`project-${socket.projectId}`).emit('cursor-move', {
        socketId: socket.id,
        userId: socket.userId,
        ...data,
      })
    })

    // Handle file save
    socket.on('file-save', (data: { fileId: string; content: string }) => {
      if (!socket.projectId) return

      io.to(`project-${socket.projectId}`).emit('file-saved', {
        fileId: data.fileId,
        userId: socket.userId,
        savedAt: new Date(),
      })
    })

    // Handle terminal output
    socket.on('terminal-output', (data: { output: string; type: 'stdout' | 'stderr' }) => {
      if (!socket.projectId) return

      io.to(`project-${socket.projectId}`).emit('terminal-output', {
        ...data,
        timestamp: Date.now(),
      })
    })

    // Handle code execution
    socket.on('execute-code', (data: { fileId: string; language: string }) => {
      if (!socket.projectId) return

      io.to(`project-${socket.projectId}`).emit('code-executing', {
        fileId: data.fileId,
        userId: socket.userId,
        language: data.language,
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.projectId) {
        const editors = activeEditors.get(socket.projectId)
        if (editors) {
          editors.delete(socket.id)
        }

        const cursors = userCursors.get(socket.projectId)
        if (cursors) {
          cursors.delete(socket.id)
        }

        io.to(`project-${socket.projectId}`).emit('user-left', {
          userId: socket.userId,
          socketId: socket.id,
        })
      }

      console.log(`User ${socket.userId} disconnected: ${socket.id}`)
    })

    // Heartbeat to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong')
    })
  })

  return io
}
