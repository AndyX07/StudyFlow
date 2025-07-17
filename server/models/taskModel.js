import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course"
  }
}, {
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
