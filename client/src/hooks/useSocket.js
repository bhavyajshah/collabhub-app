import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../api';

// Reuse single socket connection across the app
let socketInstance = null;

const useSocket = (channelId) => {
  const socketRef = useRef(null);

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });
  }

  useEffect(() => {
    socketRef.current = socketInstance;

    if (channelId && socketRef.current) {
      socketRef.current.emit('joinChannel', channelId);
    }

    return () => {
      if (channelId && socketRef.current) {
        socketRef.current.emit('leaveChannel', channelId);
      }
    };
  }, [channelId]);

  const emit = useCallback((event, data) => {
    if (socketInstance) {
      socketInstance.emit(event, data);
    }
  }, []);

  const on = useCallback((event, callback) => {
    if (socketInstance) {
      socketInstance.on(event, callback);
    }
  }, []);

  const off = useCallback((event, callback) => {
    if (socketInstance) {
      socketInstance.off(event, callback);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (socketInstance) {
      socketInstance.removeAllListeners();
    }
  }, []);

  return { emit, on, off, cleanup, socket: socketInstance };
};

export default useSocket;
