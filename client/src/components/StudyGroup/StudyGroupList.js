import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const StudyGroupList = () => {
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    memberEmails: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_URL}/study-groups`, {
        withCredentials: true
      });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      alert('Failed to load study groups');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name || !newGroup.description) {
      return alert('Please fill out group name and description!');
    }

    try {
      const memberEmailsArray = newGroup.memberEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email !== '');

      const response = await axios.post(
        `${API_URL}/study-groups`,
        {
          name: newGroup.name,
          description: newGroup.description,
          memberEmails: memberEmailsArray.length > 0 ? memberEmailsArray : undefined
        },
        { withCredentials: true }
      );

      setGroups([...groups, response.data]);
      setNewGroup({ name: '', description: '', memberEmails: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <div className="study-group-list">
      <h1>Study Groups</h1>

      <button
        onClick={() => setShowCreateForm(true)}
        style={{ marginBottom: '24px' }}
      >
        + Create New Group
      </button>

      {groups.length === 0 ? (
        <div className="no-groups">
          <p>No study groups yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="groups-grid">
          {groups.map((group) => (
            <Link
              key={group._id}
              to={`/study-groups/${group._id}`}
            >
              <div className="group-card">
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                <div className="group-meta">
                  <span>👥 {group.members?.length || 0} members</span>
                  <span>📝 {group.tasks?.length || 0} tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Study Group</h2>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              rows="3"
            />
            <input
              type="text"
              placeholder="Member emails (comma-separated, optional)"
              value={newGroup.memberEmails}
              onChange={(e) => setNewGroup({ ...newGroup, memberEmails: e.target.value })}
            />
            <button onClick={handleCreateGroup}>Create Group</button>
            <button onClick={() => setShowCreateForm(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroupList;
