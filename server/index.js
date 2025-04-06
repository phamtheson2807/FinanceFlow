require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const SupportSession = require('./models/SupportSession');
require('./config/passport');

const app = express();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
});

// Log JWT_SECRET ngay khi khởi động
console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://vocal-speculoos-dc51b5.netlify.app', // URL Netlify của bạn
      'https://quanlythuchi.vercel.app' // URL Vercel của bạn (đã có trong render.yaml)
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.options('*', cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Manager API',
      version: '1.0.0',
      description: 'API quản lý thu chi cá nhân',
    },
    servers: [{ url: 'http://localhost:5000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
console.log('📄 Swagger UI: http://localhost:5000/api-docs');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');
const investmentsRouter = require('./routes/investments');
const savingsRoutes = require('./routes/savings');
const notificationsRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');
const settingsRoutes = require('./routes/settings');
const supportRoutes = require('./routes/support');
const subscriptionRoutes = require('./routes/subscription');
const budgetRoutes = require('./routes/budget');

app.use('/api/budgets', budgetRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/investments', investmentsRouter);
app.use('/api/savings', savingsRoutes);
app.use('/api', notificationsRoutes);
app.use('/api/support', supportRoutes);

// Socket.IO logic (giữ nguyên)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    console.error('❌ Token không tồn tại trong WebSocket');
    return next(new Error('Token không tồn tại'));
  }

  jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('❌ Token không hợp lệ trong WebSocket:', err.message);
      return next(new Error('Token không hợp lệ'));
    }
    if (!decoded.id) {
      console.error('❌ Token không chứa ID user:', decoded);
      return next(new Error('Token không hợp lệ: thiếu ID user'));
    }
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('📡 New WebSocket connection:', socket.id, 'User:', socket.user.id);

  if (socket.user.role === 'admin') {
    socket.join('admin_room');
    console.log('📡 Admin joined admin_room:', socket.user.id);
  }

  socket.on('join-support', async ({ userId }) => {
    if (!userId || userId !== socket.user.id) {
      console.error('❌ User ID không hợp lệ trong join-support:', userId);
      socket.emit('error', 'User ID không hợp lệ');
      return;
    }

    try {
      let session = await SupportSession.findById(userId);
      if (!session) {
        const user = await User.findById(userId).select('name email');
        if (!user) {
          console.error('❌ Không tìm thấy user:', userId);
          socket.emit('error', 'Không tìm thấy người dùng');
          return;
        }
        session = await SupportSession.create({
          _id: userId,
          userId,
          userName: user.name,
          userEmail: user.email,
          messages: [],
          status: 'active',
          unreadCount: 0,
        });
        console.log('✅ Tạo mới session hỗ trợ:', session._id);
      }

      socket.join(`support_${userId}`);
      console.log(`📡 User ${userId} joined support room: support_${userId}`);

      io.to('admin_room').emit('new-session', {
        _id: session._id,
        userId: session.userId,
        userName: session.userName,
        userEmail: session.userEmail,
        messages: session.messages,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        unreadCount: session.unreadCount,
      });
    } catch (error) {
      console.error('❌ Lỗi khi xử lý join-support:', error);
      socket.emit('error', 'Lỗi khi tham gia phòng hỗ trợ');
    }
  });

  socket.on('message', async (message) => {
    if (!message.sessionId || !message.content) {
      console.error('❌ Message không hợp lệ:', message);
      socket.emit('error', 'Tin nhắn không hợp lệ');
      return;
    }

    const newMessage = {
      _id: Date.now().toString(),
      sender: socket.user.role === 'admin' ? 'admin' : 'user',
      content: message.content,
      createdAt: new Date(),
    };

    try {
      const session = await SupportSession.findById(message.sessionId);
      if (!session) {
        console.error('❌ Không tìm thấy session:', message.sessionId);
        socket.emit('error', 'Không tìm thấy phiên hỗ trợ');
        return;
      }

      session.messages.push(newMessage);
      session.unreadCount = socket.user.role === 'admin' ? 0 : session.unreadCount + 1;
      await session.save();

      console.log(`📩 Phát tin nhắn tới support_${message.sessionId} và admin_room:`, newMessage);
      io.to(`support_${message.sessionId}`).emit('message', newMessage);
      io.to('admin_room').emit('message', { ...newMessage, sessionId: message.sessionId });
    } catch (error) {
      console.error('❌ Lỗi khi xử lý tin nhắn:', error);
      socket.emit('error', 'Lỗi khi gửi tin nhắn');
    }
  });

  socket.on('disconnect', () => {
    console.log('📡 User disconnected:', socket.id);
  });
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch((err) => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  console.error('🚨 MongoDB Lost Connection:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server (Express + WebSocket) running on http://localhost:${PORT}`);
  console.log(
    'Routes đã gắn:',
    app._router.stack
      .filter((r) => r.route)
      .map((r) => `${r.route.path} (${Object.keys(r.route.methods).join(', ')})`)
  );
}).on('error', (err) => {
  console.error('❌ Lỗi khởi động server:', err);
});

// Thêm đoạn code này vào phần cấu hình CORS trong file index.js
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://quanlythuchi.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));