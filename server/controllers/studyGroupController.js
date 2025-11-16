import StudyGroup from '../models/studyGroupModel.js';
import User from '../models/userModel.js';
import GroupTask from '../models/groupTaskModel.js';

// Create a new study group
export const createGroup = async (req, res, next) => {
  const { name, description, memberEmails } = req.body;
  const userId = req.user._id;

  try {
    let memberIds = [userId];
    
    if (memberEmails && memberEmails.length > 0) {
      const users = await User.find({ email: { $in: memberEmails } });
      const additionalIds = users.map(user => user._id);
      memberIds = [userId, ...additionalIds.filter(id => id.toString() !== userId.toString())];
    }

    const newGroup = new StudyGroup({
      name,
      description,
      creator: userId,
      members: memberIds,
      tasks: [],
      messages: []
    });

    const savedGroup = await newGroup.save();
    const populatedGroup = await StudyGroup.findById(savedGroup._id)
      .populate('members', 'name email')
      .populate('creator', 'name email');
    
    res.status(201).json(populatedGroup);
  } catch (err) {
    next(err);
  }
};

// Get all groups for a user
export const getUserGroups = async (req, res, next) => {
  try {
    const groups = await StudyGroup.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('creator', 'name email')
      .sort({ updatedAt: -1 });
    
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
};

// Get a specific group by ID
export const getGroupById = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('members', 'name email')
      .populate('creator', 'name email')
      .populate('messages.user', 'name email');

    if (!group) {
      res.status(404);
      throw new Error('Study group not found');
    }

    if (!group.members.some(member => member._id.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to view this group');
    }

    const tasks = await GroupTask.find({ studyGroup: group._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    const groupData = group.toObject();
    groupData.tasks = tasks;

    res.status(200).json(groupData);
  } catch (err) {
    next(err);
  }
};

// Add a member to the group
export const addMember = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404);
      throw new Error('Study group not found');
    }

    if (!group.members.some(member => member.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const userToAdd = await User.findOne({ email });
    
    if (!userToAdd) {
      res.status(404);
      throw new Error('User not found');
    }

    if (group.members.includes(userToAdd._id)) {
      res.status(400);
      throw new Error('User already in group');
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updatedGroup = await StudyGroup.findById(group._id)
      .populate('members', 'name email');

    res.status(200).json(updatedGroup);
  } catch (err) {
    next(err);
  }
};

// Remove a member from the group
export const removeMember = async (req, res, next) => {
  const { userId } = req.body;
  
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404);
      throw new Error('Study group not found');
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only group creator can remove members');
    }

    if (group.creator.toString() === userId) {
      res.status(400);
      throw new Error('Cannot remove group creator');
    }

    group.members = group.members.filter(member => member.toString() !== userId);
    await group.save();

    const updatedGroup = await StudyGroup.findById(group._id)
      .populate('members', 'name email');

    res.status(200).json(updatedGroup);
  } catch (err) {
    next(err);
  }
};

// Get messages for a group
export const getGroupMessages = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('messages.user', 'name email');

    if (!group) {
      res.status(404);
      throw new Error('Study group not found');
    }

    if(!group.members.some(member => member.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized to view messages in this group');
    }

    res.status(200).json(group.messages);
  } catch (err) {
    next(err);
  }
};

// Leave a group
export const leaveGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404);
      throw new Error('Study group not found');
    }

    if (group.creator.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Creator cannot leave group. Delete the group instead.');
    }

    group.members = group.members.filter(member => member.toString() !== req.user._id.toString());
    await group.save();

    res.status(200).json({ message: 'Left group successfully' });
  } catch (err) {
    next(err);
  }
};

// Delete a group (creator only)
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    
    if (!group) {
      res.status(404);
      throw new Error('Study group not found');
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Only group creator can delete the group');
    }

    await GroupTask.deleteMany({ studyGroup: group._id });
    await StudyGroup.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Group deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const addMessage = async (req, res, next) => {
    try {
        const group = await StudyGroup.findById(req.params.id);
        if (!group) {
            res.status(404);
            throw new Error('Study group not found');
        }
        if(!group.members.some(member => member.toString() === req.user._id.toString())) {
            res.status(403);
            throw new Error('Not authorized to post messages in this group');
        }
        const newMessage = {
            user: req.user._id,
            username: req.user.name,
            message: req.body.message
        };
        group.messages.push(newMessage);
        await group.save();

        const newMessages = await StudyGroup.findById(req.params.id).populate('messages.user', 'name email');

        res.status(201).json(newMessages.messages[newMessages.messages.length - 1]);
    } catch (err) {
        next(err);
    }
}