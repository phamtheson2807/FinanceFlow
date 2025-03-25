import SendIcon from '@mui/icons-material/Send';
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { closeSocket, getSocket, initSocket } from '../../services/socketService';
import axiosInstance from '../../utils/axiosInstance';

interface Message {
  _id: string;
  sessionId: string;
  sender: 'user' | 'admin';
  content: string;
  createdAt: Date;
}

interface ChatSession {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  messages: Message[];
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  unreadCount: number;
}

const SupportChat: React.FC<{ session: ChatSession }> = ({ session }) => {
  const [messageInput, setMessageInput] = useState('');
  const socket = getSocket();

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !socket || !socket.connected) {
      console.error('❌ Không thể gửi tin nhắn: Socket chưa kết nối hoặc tin nhắn rỗng');
      return;
    }

    const newMessage: Message = {
      _id: Date.now().toString(),
      sessionId: session._id,
      sender: 'admin',
      content: messageInput,
      createdAt: new Date(),
    };

    socket.emit('message', newMessage);
    setMessageInput('');
  }, [messageInput, session._id, socket]);

  return (
    <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
        <Typography variant="h6">{session.userName} ({session.userEmail})</Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {session.messages.map((msg) => (
          <Box
            key={msg._id}
            sx={{
              mb: 1,
              display: 'flex',
              justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
            }}
          >
            <Typography
              sx={{
                bgcolor: msg.sender === 'admin' ? 'primary.main' : 'grey.200',
                color: msg.sender === 'admin' ? 'white' : 'text.primary',
                p: 1,
                borderRadius: 2,
                maxWidth: '70%',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              {msg.content}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderTop: '1px solid', borderColor: 'grey.300' }}>
        <TextField
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          fullWidth
          placeholder="Nhập tin nhắn..."
          variant="outlined"
          size="small"
        />
        <IconButton onClick={handleSendMessage} sx={{ ml: 1, color: 'primary.main' }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

const AdminSupportPage: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/admin/support/sessions');
      console.log('📡 Sessions fetched:', response.data);
      setSessions(response.data.sessions || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error.message);
      setError('Không thể tải danh sách phiên hỗ trợ: ' + (error.response?.data?.message || error.message));
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để truy cập hỗ trợ.');
      return;
    }

    const socket = initSocket(token);

    socket.on('connect', () => {
      console.log('✅ Admin connected to support system');
      fetchSessions(); // Gọi API khi kết nối thành công
    });

    socket.on('connect_error', (err: Error) => {
      console.error('❌ Socket connection error:', err.message);
      setError('Không thể kết nối đến hệ thống hỗ trợ: ' + err.message);
    });

    socket.on('new-session', (session: ChatSession) => {
      console.log('📡 New session received:', session);
      setSessions((prev) => [...prev, { ...session, messages: session.messages || [], unreadCount: 1 }]);
    });

    socket.on('message', (message: Message & { sessionId: string }) => { // Cập nhật kiểu để bao gồm sessionId
      console.log('📩 New message received:', message);
      setSessions((prev) =>
        prev.map((session) =>
          session._id === message.sessionId
            ? {
                ...session,
                messages: [...session.messages, message],
                unreadCount: selectedSession?._id === session._id ? 0 : session.unreadCount + 1,
              }
            : session
        )
      );
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    return () => {
      console.log('✅ Closing socket from AdminSupportPage');
      closeSocket();
    };
  }, [fetchSessions, selectedSession]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1E3A8A' }}>
        Quản lý hỗ trợ
      </Typography>
      {error && (
        <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>{error}</Typography>
      )}

      <Box sx={{ display: 'flex', height: 'calc(100vh - 180px)', gap: 2 }}>
        {/* Sessions list */}
        <Paper
          sx={{
            width: { xs: '100%', sm: 300 },
            height: '100%',
            overflow: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ p: 2, bgcolor: '#1E3A8A', color: 'white', fontFamily: 'Poppins, sans-serif' }}
          >
            Danh sách người dùng
          </Typography>
          <List>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <ListItem
                  key={session._id}
                  button
                  selected={selectedSession?._id === session._id}
                  onClick={() => setSelectedSession(session)}
                  sx={{
                    '&.Mui-selected': { bgcolor: 'primary.light' },
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  <ListItemAvatar>
                    <Badge badgeContent={session.unreadCount} color="error">
                      <Avatar>{session.userName[0]}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={session.userName}
                    secondary={session.userEmail}
                    primaryTypographyProps={{ fontFamily: 'Poppins, sans-serif' }}
                    secondaryTypographyProps={{ fontFamily: 'Poppins, sans-serif' }}
                  />
                </ListItem>
              ))
            ) : (
              <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                Chưa có phiên hỗ trợ nào
              </Typography>
            )}
          </List>
        </Paper>

        {/* Chat area */}
        <Paper sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {selectedSession ? (
            <SupportChat session={selectedSession} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="text.secondary" sx={{ fontFamily: 'Poppins, sans-serif' }}>
                Chọn một người dùng để bắt đầu trò chuyện
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminSupportPage;