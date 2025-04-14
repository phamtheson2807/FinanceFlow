import { Close, Send } from '@mui/icons-material';
import {
    Avatar,
    Box,
    CircularProgress,
    IconButton,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import config from '../config'; // Add import for config

// Unused interface can be removed or kept if needed for future use
interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isAdmin: boolean;
}

interface ChatSession {
  _id: string;
  userId: string;
  messages: Message[];
  status: 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const SupportChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);

  // Thay đổi URL tuyệt đối trong fetchChatHistory
  const fetchChatHistory = async () => {
    if (!user?._id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${config.apiUrl}/support/chat/${user._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.session) {
        setChatSession(data.session);
        setMessages(data.session.messages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Thay đổi URL tuyệt đối trong useEffect
  useEffect(() => {
    if (!user?._id) return;
  
    const token = localStorage.getItem('token');
    if (!token) return;
  
    const newSocket = io(config.apiUrl.replace('/api', ''), {
      auth: { token: token.startsWith('Bearer ') ? token.split(' ')[1] : token },
      transports: ['websocket', 'polling'],
      reconnection: true,
    });
  
    newSocket.on('connect', () => {
      console.log('Connected to support chat');
      fetchChatHistory();
    });

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket?.close();
    };
  }, [user?._id, fetchChatHistory]); // Add fetchChatHistory to dependencies

  const handleSend = async () => {
    if (!input.trim() || !socket || !user?._id) return;

    setIsLoading(true);
    try {
      const message = {
        senderId: user._id,
        content: input.trim(),
        timestamp: new Date(),
        isAdmin: false,
        sessionId: chatSession?._id
      };

      socket.emit('support-message', message);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Paper sx={{
      width: 350,
      height: 500,
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }}>
      <Box sx={{
        p: 2,
        bgcolor: '#1E3A8A',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">Hỗ trợ trực tuyến</Typography>
        <IconButton color="inherit" size="small">
          <Close />
        </IconButton>
      </Box>

      <Box sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.isAdmin ? 'flex-start' : 'flex-end',
              alignItems: 'flex-start',
              gap: 1
            }}
          >
            {message.isAdmin && (
              <Avatar sx={{ width: 32, height: 32, bgcolor: '#1E3A8A' }}>A</Avatar>
            )}
            <Paper sx={{
              p: 1,
              bgcolor: message.isAdmin ? '#f5f5f5' : '#1E3A8A',
              color: message.isAdmin ? 'text.primary' : 'white',
              maxWidth: '70%'
            }}>
              <Typography variant="body2">{message.content}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSend} disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : <Send />}
              </IconButton>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default SupportChat;
