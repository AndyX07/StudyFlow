import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../hooks/useSocket';
import GroupChat from './GroupChat';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const StudyGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: []
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const {
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
  } = useSocket(id);

  useEffect(() => {
    fetchGroup();
    fetchCurrentUser();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    socket.on('task-added', (task) => {
      setGroup((prev) => ({
        ...prev,
        tasks: [...prev.tasks, task]
      }));
    });

    socket.on('task-modified', (updatedTask) => {
      setGroup((prev) => ({
        ...prev,
        tasks: prev.tasks.map((task) => 
          task._id === updatedTask._id ? updatedTask : task
        )
      }));
    });

    socket.on('task-removed', (taskId) => {
      setGroup((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((task) => task._id !== taskId)
      }));
    });

    socket.on('member-joined', (members) => {
        setGroup((prev) => ({
          ...prev,
          members
        }));
    });

    socket.on('member-left', (memberId) => {
        console.log(memberId);
        setGroup((prev) => ({
            ...prev,
            members: prev.members.filter(member => member._id !== memberId)
        }))
    });

    return () => {
      socket.off('task-added');
      socket.off('task-modified');
      socket.off('task-removed');
      socket.off('member-joined');
      socket.off('member-left');
    };
  }, [socket]);

  const fetchGroup = async () => {
    try {
      const response = await axios.get(`${API_URL}/study-groups/${id}`, {
        withCredentials: true
      });
      setGroup(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
      alert('Failed to load group');
      navigate('/study-groups');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.description || !newTask.dueDate) {
      return alert('Please fill out all task fields!');
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/study-groups/${id}/tasks`,
        newTask,
        { withCredentials: true }
      );

      setGroup({
        ...group,
        tasks: [...group.tasks, response.data]
      });

      emitTaskCreated(id, response.data);

      setNewTask({ title: '', description: '', dueDate: '', assignedTo: [] });
      setShowAddTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert(error.response?.data?.message || 'Failed to add task');
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      return alert('Please enter an email address!');
    }
    
    try {
      const response = await axios.post(
        `${API_URL}/study-groups/${id}/members`,
        { email: newMemberEmail },
        { withCredentials: true }
      );
      setNewMemberEmail('');
      setShowAddMember(false);
      setGroup((prev) => ({
        ...prev,
        members: response.data.members
      }));
      emitMemberAdded(id, response.data.members);
    } catch (error) {
      console.error('Error adding member:', error);
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
        const response = await axios.delete(
            `${API_URL}/study-groups/${id}/members`,
            { data: { userId: memberId }, withCredentials: true }
        );
        setGroup((prev) => ({
            ...prev,
            members: prev.members.filter(member => member._id !== memberId)
        }));
        emitMemberRemoved(id, memberId);
    } catch (error) {
        console.error('Error removing member:', error);
        alert(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/study-groups/${id}/tasks/${taskId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      setGroup({
        ...group,
        tasks: group.tasks.map(task => 
          task._id === taskId ? response.data : task
        )
      });

      emitTaskUpdated(id, response.data);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await axios.delete(`${API_URL}/study-groups/${id}/tasks/${taskId}`, {
        withCredentials: true
      });

      setGroup({
        ...group,
        tasks: group.tasks.filter(task => task._id !== taskId)
      });

      emitTaskDeleted(id, taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      assignedTo: task.assignedTo ? task.assignedTo.map(u => u._id || u) : []
    });
  };

  const handleUpdateTask = async () => {
    if (!editingTask.title || !editingTask.description || !editingTask.dueDate) {
      return alert('Please fill out all task fields!');
    }

    try {
      const response = await axios.put(
        `${API_URL}/study-groups/${id}/tasks/${editingTask._id}`,
        {
          title: editingTask.title,
          description: editingTask.description,
          dueDate: editingTask.dueDate,
          assignedTo: editingTask.assignedTo,
          status: editingTask.status
        },
        { withCredentials: true }
      );

      setGroup({
        ...group,
        tasks: group.tasks.map(task => 
          task._id === editingTask._id ? response.data : task
        )
      });

      emitTaskUpdated(id, response.data);

      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleEditAssignedToChange = (userId) => {
    setEditingTask(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const handleAssignedToChange = (userId) => {
    setNewTask(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;

    try {
      await axios.post(`${API_URL}/study-groups/${id}/leave`, {}, {
        withCredentials: true
      });
      emitMemberRemoved(id, currentUser._id);
      navigate('/study-groups');
    } catch (error) {
      console.error('Error leaving group:', error);
      alert(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API_URL}/study-groups/${id}`, {
        withCredentials: true
      });
      navigate('/study-groups');
    } catch (error) {
      console.error('Error deleting group:', error);
      alert(error.response?.data?.message || 'Failed to delete group');
    }
  };

  if (!group) {
    return <div className="loading">Loading...</div>;
  }

  const isCreator = currentUser?._id === group.creator?._id;

  return (
    <div className="study-group-details">
      <div className="group-header">
        <div>
          <h1>{group.name}</h1>
          <p>{group.description}</p>
        </div>
        <div className="header-actions">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </div>
          {isCreator ? (
            <button onClick={handleDeleteGroup} className="delete-group-btn">
              Delete Group
            </button>
          ) : (
            <button onClick={handleLeaveGroup} className="leave-group-btn">
              Leave Group
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${!showChat ? 'active' : ''}`} 
          onClick={() => setShowChat(false)}
        >
          Tasks & Members
        </button>
        <button 
          className={`tab ${showChat ? 'active' : ''}`} 
          onClick={() => setShowChat(true)}
        >
          Chat
        </button>
      </div>

      {showChat ? (
        <GroupChat
            groupId={id}
            currentUser={currentUser}
            socket={socket}
            emitSendMessage={emitSendMessage}
            emitStartTyping={emitStartTyping}
            emitStopTyping={emitStopTyping} />
      ) : (
        <>
          <div className="section">
            <div className="section-header">
              <h2>Members ({group.members.length})</h2>
              <button onClick={() => setShowAddMember(true)} className="section-btn">
                + Add Member
              </button>
            </div>

            <div className="members-list">
              {group.members.map(member => (
                <div key={member._id} className="member-item">
                  <div className="member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <div className="member-name">
                      {member.name}
                      {member._id === group.creator._id && <span className="creator-badge">Creator</span>}
                    </div>
                    <div className="member-email">{member.email}</div>
                  </div>
                  {isCreator && member._id !== group.creator._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="remove-member-btn"
                      title="Remove member"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Tasks ({group.tasks?.length || 0})</h2>
              <button onClick={() => setShowAddTask(true)} className="section-btn">
                + Add Task
              </button>
            </div>

            <div className="tasks-list">
              {!group.tasks || group.tasks.length === 0 ? (
                <p className="no-items">No tasks yet. Add one to get started!</p>
              ) : (
                group.tasks.map(task => (
                  <div key={task._id} className="task-item">
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                          className="task-status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        {(isCreator || task.createdBy?._id === currentUser?._id) && (
                          <>
                            <button
                              onClick={() => handleEditTask(task)}
                              title="Edit task"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      {task.assignedTo && task.assignedTo.length > 0 && (
                        <span>
                          Assigned: {task.assignedTo.map(u => u.name).join(', ')}
                        </span>
                      )}
                      {task.createdBy && (
                        <span>Created by: {task.createdBy.name}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showAddMember && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Member</h2>
            <input
              type="email"
              placeholder="Member's email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
            />
            <button onClick={handleAddMember}>Add Member</button>
            <button onClick={() => setShowAddMember(false)}>Close</button>
          </div>
        </div>
      )}

      {showAddTask && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              rows="3"
            />
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            
            <div className="assign-section">
              <label>Assign to:</label>
              {group.members.map(member => (
                <label key={member._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newTask.assignedTo.includes(member._id)}
                    onChange={() => handleAssignedToChange(member._id)}
                  />
                  {member.name}
                </label>
              ))}
            </div>

            <button onClick={handleAddTask}>Add Task</button>
            <button onClick={() => setShowAddTask(false)}>Close</button>
          </div>
        </div>
      )}

      {editingTask && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Task</h2>
            <input
              type="text"
              placeholder="Task Title"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              rows="3"
            />
            <input
              type="date"
              value={editingTask.dueDate}
              onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
            />
            
            <div className="assign-section">
              <label>Assign to:</label>
              {group.members.map(member => (
                <label key={member._id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editingTask.assignedTo.includes(member._id)}
                    onChange={() => handleEditAssignedToChange(member._id)}
                  />
                  {member.name}
                </label>
              ))}
            </div>

            <button onClick={handleUpdateTask}>Update Task</button>
            <button onClick={() => setEditingTask(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupDetails;
