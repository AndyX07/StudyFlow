import Task from '../models/taskModel.js';
import Course from '../models/courseModel.js';

export const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
      next(err);
    }
};

export const createTask = async (req, res, next) => {
  const { title, description, dueDate, status } = req.body;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add tasks to this course' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      status: status || 'pending',
      course: courseId,
    });

    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.taskId, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
};
