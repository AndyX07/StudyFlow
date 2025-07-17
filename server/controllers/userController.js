import User from '../models/userModel.js';

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('courses');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};