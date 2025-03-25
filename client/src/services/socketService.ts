// src/services/socketService.ts
import { io } from 'socket.io-client';

let socket: any = null;

export const initSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }

  if (!token) {
    console.error('❌ Token không tồn tại, không thể kết nối WebSocket');
    throw new Error('Token không tồn tại');
  }

  socket = io('http://localhost:5000', { // Sửa từ ws:// thành http://
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', (err: Error) => {
    console.error('Socket connection error:', err.message, err.stack);
  });

  socket.on('disconnect', () => {
    console.log('📡 Socket disconnected');
  });

  console.log('📡 Socket initialized with full token:', `Bearer ${token}`); // In toàn bộ token
  return socket;
};

export const getSocket = () => socket;

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('📡 Socket disconnected');
  }
};