import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const useSocket = (groupId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      if (groupId) {
        newSocket.emit('join-group', groupId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (groupId) {
        newSocket.emit('leave-group', groupId);
      }
      newSocket.close();
    };
  }, [groupId]);

  const emitSendMessage = (groupId, message) => {
    if (socket) {
      socket.emit('send-message', { groupId, message });
    }
  };

  const emitTaskCreated = (groupId, task) => {
    if (socket) {
      socket.emit('task-created', { groupId, task });
    }
  };

  const emitTaskUpdated = (groupId, task) => {
    if (socket) {
      socket.emit('task-updated', { groupId, task });
    }
  };

  const emitTaskDeleted = (groupId, taskId) => {
    if (socket) {
      socket.emit('task-deleted', { groupId, taskId });
    }
  };

  const emitMemberAdded = (groupId, member) => {
    if (socket) {
        socket.emit('member-added', { groupId, member });
    }
  }

  const emitMemberRemoved = (groupId, memberId) => {
    if (socket) {
        socket.emit('member-removed', { groupId, memberId });
    }
  }

  const emitStartTyping = (groupId) => {
    if (socket) {
      socket.emit('typing-start', { groupId });
    }
  };

  const emitStopTyping = (groupId) => {
    if (socket) {
      socket.emit('typing-stop', { groupId });
    }
  };

  return {
    socket,
    isConnected,
    emitSendMessage,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitMemberAdded,
    emitMemberRemoved,
    emitStartTyping,
    emitStopTyping
  };
};
