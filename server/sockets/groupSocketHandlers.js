import StudyGroup from '../models/studyGroupModel.js';

export const handleGroupEvents = (io, socket) => {
  // Join a study group room
  socket.on('join-group', async (groupId) => {
    try {
      const group = await StudyGroup.findById(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      if (!group.members.some(member => member.toString() === socket.userId.toString())) {
        socket.emit('error', { message: 'Not authorized to join this group' });
        return;
      }

      socket.join(groupId);
      console.log(`${socket.username} joined group ${groupId}`);

      socket.to(groupId).emit('user-joined', {
        userId: socket.userId,
        username: socket.username,
        socketId: socket.id
      });

      socket.emit('joined-group', { groupId });
    } catch (error) {
      console.error('Error joining group:', error);
      socket.emit('error', { message: 'Error joining group' });
    }
  });

  // Leave a study group room
  socket.on('leave-group', (groupId) => {
    socket.leave(groupId);
    console.log(`${socket.username} left group ${groupId}`);

    socket.to(groupId).emit('user-left', {
      userId: socket.userId,
      username: socket.username,
      socketId: socket.id
    });
  });

  // Send a chat message
  socket.on('send-message', async ({ groupId, message }) => {
    try {
      const group = await StudyGroup.findById(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      io.to(groupId).emit('receive-message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Error sending message' });
    }
  });

  // Task created event
  socket.on('task-created', async ({ groupId, task }) => {
    try {
      const group = await StudyGroup.findById(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      socket.to(groupId).emit('task-added', task);
    } catch (error) {
      console.error('Error broadcasting task creation:', error);
    }
  });

  // Task updated event
  socket.on('task-updated', async ({ groupId, task }) => {
    try {
      const group = await StudyGroup.findById(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      io.to(groupId).emit('task-modified', task);
    } catch (error) {
      console.error('Error broadcasting task update:', error);
    }
  });

  // Task deleted event
  socket.on('task-deleted', async ({ groupId, taskId }) => {
    try {
      const group = await StudyGroup.findById(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      // Broadcast to all members in the group
      io.to(groupId).emit('task-removed', taskId);
    } catch (error) {
      console.error('Error broadcasting task deletion:', error);
    }
  });

  // Member added event
  socket.on('member-added', ({ groupId, members }) => {
    socket.to(groupId).emit('member-joined', members);
  });

  // Member removed event
  socket.on('member-removed', ({ groupId, memberId }) => {
    socket.to(groupId).emit('member-left', memberId);
  });

  // Typing indicator
  socket.on('typing-start', ({ groupId }) => {
    socket.to(groupId).emit('user-typing', {
      userId: socket.userId,
      username: socket.username
    });
  });

  socket.on('typing-stop', ({ groupId }) => {
    socket.to(groupId).emit('user-stopped-typing', {
      userId: socket.userId
    });
  });
};