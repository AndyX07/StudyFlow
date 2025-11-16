import GroupTask from '../models/groupTaskModel.js';
import StudyGroup from '../models/studyGroupModel.js';

// Create a task in a study group
export const createGroupTask = async (req, res, next) => {
  const { title, description, dueDate, assignedTo } = req.body;
  const { groupId } = req.params;
  
  try {
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
        res.status(404);
        throw new Error('Study group not found');
    }

    if (!group.members.some(member => member.toString() === req.user._id.toString())) {
        res.status(403);
        throw new Error('Not authorized to add tasks to this group');
    }

    const newTask = new GroupTask({
      title,
      description,
      dueDate,
      studyGroup: groupId,
      assignedTo: assignedTo || [],
      createdBy: req.user._id,
      status: 'pending'
    });

    const savedTask = await newTask.save();
    
    group.tasks.push(savedTask._id);
    await group.save();

    const populatedTask = await GroupTask.findById(savedTask._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (err) {
    next(err);
  }
};

// Get all tasks for a study group
export const getGroupTasks = async (req, res, next) => {
  const { groupId } = req.params;
  
  try {
    const group = await StudyGroup.findById(groupId);
    
    if (!group) {
        res.status(404);
        throw new Error('Study group not found');
    }

    if (!group.members.some(member => member.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const tasks = await GroupTask.find({ studyGroup: groupId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// Update a group task
export const updateGroupTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, dueDate, status, assignedTo } = req.body;
  
  try {
    const task = await GroupTask.findById(taskId);
    
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const group = await StudyGroup.findById(task.studyGroup);
    
    if (!group.members.some(member => member.toString() === req.user._id.toString())) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const updatedTask = await task.save();
    const populatedTask = await GroupTask.findById(updatedTask._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json(populatedTask);
  } catch (err) {
    next(err);
  }
};

// Delete a group task
export const deleteGroupTask = async (req, res, next) => {
  const { taskId } = req.params;
  
  try {
    const task = await GroupTask.findById(taskId);
    
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const group = await StudyGroup.findById(task.studyGroup);
    
    if (group.creator.toString() !== req.user._id.toString() && 
        task.createdBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this task');
    }

    group.tasks = group.tasks.filter(t => t.toString() !== taskId);
    await group.save();
    
    await GroupTask.findByIdAndDelete(taskId);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
