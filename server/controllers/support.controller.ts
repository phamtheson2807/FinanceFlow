import { Request, Response } from 'express';
import SupportSession from '../models/SupportSession';
import { User } from '../models/User'; // Import type User

export class SupportController {
  static async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ message: 'User ID không hợp lệ' });
      }

      const session = await SupportSession.findById(userId);
      if (!session) {
        return res.status(404).json({ message: 'Không tìm thấy phiên hỗ trợ cho user này' });
      }

      res.json({
        sessionId: session._id,
        userId: session.userId,
        messages: session.messages,
        status: session.status,
        unreadCount: session.unreadCount,
      });
    } catch (error) {
      console.error('❌ Lỗi khi lấy lịch sử chat:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy lịch sử chat', error: error.message });
    }
  }

  static async getAllSessions(req: Request, res: Response) {
    try {
      const isAdmin = req.user && (req.user as User).role === 'admin';
      let sessions;

      if (isAdmin) {
        // Admin thấy tất cả sessions
        sessions = await SupportSession.find().sort({ updatedAt: -1 }).lean();
      } else {
        // User chỉ thấy session của chính mình
        sessions = await SupportSession.find({ userId: (req.user as User)._id }).sort({ updatedAt: -1 }).lean();
      }

      res.json({ sessions });
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách sessions:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lấy danh sách phiên hỗ trợ', error: error.message });
    }
  }

  static async saveMessage(req: Request, res: Response) {
    try {
      const { sessionId, content, sender } = req.body;
      if (!sessionId || !content || !sender) {
        return res.status(400).json({ message: 'Thiếu sessionId, content, hoặc sender' });
      }

      if (!['user', 'admin'].includes(sender)) {
        return res.status(400).json({ message: 'Sender phải là "user" hoặc "admin"' });
      }

      // Kiểm tra quyền gửi tin nhắn
      if (sender !== 'admin' && (req.user as User)._id !== sender) {
        return res.status(403).json({ message: 'Không có quyền gửi tin nhắn với vai trò này' });
      }

      const session = await SupportSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Không tìm thấy phiên hỗ trợ' });
      }

      const newMessage = {
        _id: Date.now().toString(),
        sender,
        content,
        createdAt: new Date(),
      };

      session.messages.push(newMessage);
      session.unreadCount = sender === 'admin' ? 0 : session.unreadCount + 1;
      await session.save();

      // Lấy io từ app (giả sử đã gắn trong index.js)
      const io = req.app.get('socketio');
      if (io) {
        io.to(`support_${sessionId}`).emit('message', newMessage);
        io.to('admin_room').emit('message', { ...newMessage, sessionId });
        console.log(`📩 Phát tin nhắn qua WebSocket tới support_${sessionId} và admin_room`);
      } else {
        console.error('❌ Socket.io không được gắn vào app');
      }

      res.status(201).json({ message: 'Tin nhắn đã được lưu', data: newMessage });
    } catch (error) {
      console.error('❌ Lỗi khi lưu tin nhắn:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi lưu tin nhắn', error: error.message });
    }
  }

  static async updateSession(req: Request, res: Response) {
    try {
      const sessionId = req.params.sessionId;
      const { status } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID không hợp lệ' });
      }

      if (!status || !['active', 'closed'].includes(status)) {
        return res.status(400).json({ message: 'Trạng thái phải là "active" hoặc "closed"' });
      }

      const session = await SupportSession.findById(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Không tìm thấy phiên hỗ trợ' });
      }

      session.status = status;
      session.unreadCount = status === 'closed' ? 0 : session.unreadCount;
      await session.save();

      // Phát cập nhật trạng thái qua WebSocket nếu cần
      const io = req.app.get('socketio');
      if (io) {
        io.to(`support_${sessionId}`).emit('sessionUpdated', { sessionId, status });
        io.to('admin_room').emit('sessionUpdated', { sessionId, status });
        console.log(`📡 Phát cập nhật trạng thái phiên ${sessionId} qua WebSocket`);
      }

      res.json({ message: 'Phiên hỗ trợ đã được cập nhật', data: session });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật phiên hỗ trợ:', error);
      res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật phiên hỗ trợ', error: error.message });
    }
  }
}

export default SupportController;