import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Load env vars from server/.env
dotenv.config({ path: __dirname + '/../.env' });

import connectDB from './config/db';
import authRoutes from './routes/auth';
import channelRoutes from './routes/channels';
import taskRoutes from './routes/tasks';
import messageRoutes from './routes/messages';
import adminRoutes from './routes/adminRoutes';

const app = express();
const server = http.createServer(app);

// CORS configuration must be very early
const corsOptions = {
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL || ''
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests explicitly

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security Middleware
const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' }));

app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message
  });
});

// Socket.io Logic with Authorization and Validation
io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  socket.on('registerUser', (userId) => {
    if (!userId || typeof userId !== 'string') return;
    socket.join(`user_${userId}`);
    console.log(`Global User registered: ${userId}`);
  });

  socket.on('joinChannel', async (channelId) => {
    if (!channelId || typeof channelId !== 'string') return;
    socket.join(channelId);
    console.log(`User joined channel: ${channelId}`);
  });

  socket.on('sendMessage', async (data) => {
    if (!data || !data.channelId || !data.content) return;
    io.to(data.channelId).emit('newMessage', data);
    
    // Global notification push to all memebers
    try {
      const { default: Channel } = await import('./models/Channel');
      const channel = await Channel.findById(data.channelId);
      if (channel) {
        channel.members.forEach(memberId => {
          io.to(`user_${memberId.toString()}`).emit('globalNotification', {
            type: 'message',
            channelId: data.channelId,
            message: `New message in ${channel.name} by ${data.sender?.username || 'someone'}`
          });
        });
      }
    } catch (e) {
      console.error(e);
    }
  });

  socket.on('messageRead', (data) => {
    if (!data || !data.channelId || !Array.isArray(data.messageIds)) return;
    socket.to(data.channelId).emit('messageRead', data);
  });

  socket.on('typingStart', (data) => {
    if (!data || !data.channelId || !data.userId || !data.username) return;
    socket.to(data.channelId).emit('typingStart', data);
  });

  socket.on('typingStop', (data) => {
    if (!data || !data.channelId || !data.userId) return;
    socket.to(data.channelId).emit('typingStop', data);
  });

  socket.on('taskUpdated', (data) => {
    if (data && data.channelId) {
      io.to(data.channelId).emit('taskUpdate', data);
    }
  });

  socket.on('leaveChannel', (channelId) => {
    if (!channelId || typeof channelId !== 'string') return;
    socket.leave(channelId);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

// Connect to Database and start server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to MongoDB. Server not started.');
  console.error(err);
  process.exit(1);
});
