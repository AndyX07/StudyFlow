import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const GroupChat = ({ groupId, currentUser, socket, emitSendMessage, emitStartTyping, emitStopTyping }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-typing', ({ userId, username }) => {
      if (userId === currentUser?._id) return;
      
      setTypingUsers((prev) => {
        if (!prev.some(user => user.userId === userId)) {
          return [...prev, { userId, username }];
        }
        return prev;
      });
    });

    socket.on('user-stopped-typing', ({ userId }) => {
      setTypingUsers((prev) => prev.filter((user) => user.userId !== userId));
    });

    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stopped-typing');
    };
  }, [socket, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (socket && typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        socket.emit('typing-stop', { groupId });
      }
    };
  }, [socket, groupId]);

  useEffect(() => {
    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${API_URL}/study-groups/${groupId}/messages`, {withCredentials: true});
            setMessages(response.data);
            console.log('Fetched messages:', response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            alert('Failed to load messages');
        }
    };

    fetchMessages();
  }, [API_URL, groupId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (!socket) return;

    emitStartTyping(groupId);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(groupId);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket) return;

    try {
        const res = await axios.post(`${API_URL}/study-groups/${groupId}/messages`, {user: currentUser._id, username: currentUser.name, message: newMessage}, {withCredentials: true});
        emitSendMessage(groupId, res.data);

        setNewMessage('');
        if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        }
        emitStopTyping(groupId);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  if (!socket || !currentUser) {
    return <div className="chat-loading">Loading chat...</div>;
  }

  return (
    <div className="group-chat">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            if (!msg) return null;
            
            const sender = msg.sender || msg.user;
            const messageText = msg.text || msg.message;
            
            if (!sender) return null;
            
            const isOwnMessage = sender._id === currentUser._id;
            const prevSender = messages[index - 1]?.sender || messages[index - 1]?.user;
            const showAvatar = index === 0 || !prevSender || prevSender._id !== sender._id;
            
            return (
              <div
                key={msg._id || index}
                className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
              >
                {!isOwnMessage && showAvatar && (
                  <div className="message-avatar">
                    {sender.name?.charAt(0).toUpperCase() || sender.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
                {!isOwnMessage && !showAvatar && <div className="message-avatar-spacer" />}
                
                <div className="message-content">
                  {!isOwnMessage && showAvatar && (
                    <div className="message-sender">{sender.name || sender.username || 'Unknown'}</div>
                  )}
                  <div className="message-bubble">
                    <p>{messageText}</p>
                    <span className="message-time">{msg.timestamp ? formatTime(msg.timestamp) : ''}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">
              {typingUsers.length === 1
                ? `${typingUsers[0].username} is typing...`
                : `${typingUsers.map(u => u.username).join(', ')} are typing...`}
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          className="message-input"
        />
        <button type="submit" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default GroupChat;
