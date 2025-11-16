import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const studyGroupSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupTask' }],
    messages: [messageSchema]
  },
  { timestamps: true }
);

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema);
export default StudyGroup;