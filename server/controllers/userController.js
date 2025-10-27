import User from '../models/userModel.js';

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('courses');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};