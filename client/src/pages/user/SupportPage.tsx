import SendIcon from '@mui/icons-material/Send';
import { Box, CircularProgress, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { closeSocket, getSocket, initSocket } from '../../services/socketService';

interface Message {
  _id: string;
  sessionId: string;
  sender: 'user' | 'admin';
  content: string;
  createdAt: Date;
}

const SupportPage = () => {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;

    const socket = getSocket();
    if (!socket || !socket.connected) {
      setError('Không thể gửi tin nhắn: Chưa kết nối đến hệ thống hỗ trợ.');
      return;
    }

    const newMessage: Message = {
      _id: Date.now().toString(),
      sessionId: user!._id,
      sender: 'user',
      content: input,
      createdAt: new Date(),
    };

    socket.emit('message', newMessage);
    setMessages((prev) => [...prev, newMessage]); // Thêm tin nhắn vào UI ngay lập tức
    setInput('');
  }, [input, user]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setError('Bạn cần đăng nhập để chat với admin.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      return;
    }

    console.log('SupportPage - User:', user);
    const socket = initSocket(token);

    socket.on('connect', () => {
      console.log('✅ User connected to support system');
      socket.emit('join-support', { userId: user._id });
    });

    socket.on('message', (message: Message) => {
      console.log('📩 Nhận tin nhắn từ server:', message);
      setMessages((prev) => [...prev, message]);
    });

    socket.on('connect_error', (err: Error) => {
      console.error('❌ Socket connection error:', err.message);
      setError('Không thể kết nối đến hệ thống hỗ trợ: ' + err.message);
    });

    socket.on('error', (errMsg: string) => {
      console.error('❌ Server error:', errMsg);
      setError(errMsg);
    });

    return () => {
      console.log('✅ Đóng socket từ SupportPage');
      closeSocket();
    };
  }, [user, loading]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#1E3A8A' }}>
        Chat với Admin
      </Typography>
      {error && (
        <Typography sx={{ color: 'error.main', mb: 2, textAlign: 'center' }}>{error}</Typography>
      )}
      <List sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#fafafa', borderRadius: 2, p: 2 }}>
        {messages.map((msg) => (
          <ListItem
            key={msg._id}
            sx={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', p: 0 }}
          >
            <ListItemText
              primary={msg.content}
              secondary={new Date(msg.createdAt).toLocaleTimeString('vi-VN')}
              sx={{
                bgcolor: msg.sender === 'user' ? 'primary.light' : 'grey.200',
                color: msg.sender === 'user' ? 'white' : 'text.primary',
                p: 1.5,
                borderRadius: 2,
                maxWidth: '70%',
                fontFamily: 'Poppins, sans-serif',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          fullWidth
          placeholder="Nhập tin nhắn..."
          variant="outlined"
          size="small"
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <IconButton onClick={handleSendMessage} sx={{ ml: 1, color: 'primary.main' }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SupportPage;