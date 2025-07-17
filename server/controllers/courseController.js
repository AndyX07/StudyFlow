import Course from '../models/courseModel.js';
import Task from '../models/taskModel.js';

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ user: req.user._id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this course' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasksByCourseId = async (req, res) => {
  const { id: courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view tasks for this course' });
    }

    const tasks = await Task.find({ course: courseId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCourse = async (req, res) => {
  const { name, code, description } = req.body;
  const userId = req.user._id;
  const course = new Course({
    name,
    code,
    description,
    user: userId
  });

  try {
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
