import mongoose from 'mongoose'
import { config } from '@/config'
import { createApp } from './app'
import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { User } from './modules/users/user.model'

let server: HTTPServer
let io: SocketIOServer

async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ role: 'admin' })
    if (adminExists) {
      console.log('ℹ️  Default admin already exists')
      return
    }

    const defaultAdmin = new User({
      email: 'admin@zawj.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'ZAWJ',
      gender: 'male',
      role: 'admin',
      isVerified: true,
      isActive: true,
    })

    await defaultAdmin.save()
    console.log('✅ Default admin created: admin@zawj.com / Admin123!')
  } catch (error) {
    console.error('❌ Error creating default admin:', error)
  }
}

export async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri)
    console.log('✅ MongoDB connected')

    // Create default admin if not exists
    await createDefaultAdmin()

    // Create Express app
    const app = createApp()

    // Create HTTP server
    server = require('http').createServer(app)

    // Initialize Socket.io
    io = new SocketIOServer(server, config.socket)

    // Socket.io events
    io.on('connection', (socket) => {
      console.log('👤 User connected:', socket.id)

      socket.on('join_conversation', (conversationId: string) => {
        socket.join(conversationId)
      })

      socket.on('send_message', (data) => {
        io.to(data.conversationId).emit('receive_message', data)
      })

      socket.on('user_typing', (data) => {
        socket.to(data.conversationId).emit('user_typing', {
          userId: data.userId,
          isTyping: data.isTyping,
        })
      })

      socket.on('disconnect', () => {
        console.log('👤 User disconnected:', socket.id)
      })
    })

    // Start server
    server.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`)
      console.log(`📡 Socket.io listening on ws://localhost:${config.port}`)
    })

    return server
  } catch (error) {
    console.error('❌ Server error:', error)
    process.exit(1)
  }
}

// Start on file execution
if (require.main === module) {
  startServer()
}

export { server, io }
