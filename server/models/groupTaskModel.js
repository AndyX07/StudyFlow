import mongoose from 'mongoose';

const groupTaskSchema = new mongoose.Schema({
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
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  assignedTo: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
});

const GroupTask = mongoose.model('GroupTask', groupTaskSchema);

export default GroupTask;
