import Course from '../models/courseModel.js';
import Task from '../models/taskModel.js';
  
export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ user: req.user._id });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this course');
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const getTasksByCourseId = async (req, res, next) => {
  const { id: courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course){
      res.status(404);
      throw new Error('Course not found');
    }

    if (course.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view tasks for this course');
    }

    const tasks = await Task.find({ course: courseId });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
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
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      res.status(404);
      return next(new Error('Course not found'));
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
};
