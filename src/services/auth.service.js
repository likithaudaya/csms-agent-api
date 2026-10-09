import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const DUMMY_HASH = await bcrypt.hash('not-a-real-password', 12);

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN, algorithm: 'HS256' }
  );
}

export async function loginAgent({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash');

  const passwordOk = user
    ? await user.comparePassword(password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !passwordOk) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been disabled');
  }

  if (user.role !== 'agent') {
    throw new ApiError(403, 'This portal is for support agents only');
  }

  const token = signToken(user);

  return { token, user: user.toJSON() };
}