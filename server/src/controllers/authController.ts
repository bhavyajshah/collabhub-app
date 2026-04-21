import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { validateEmail, validatePassword } from '../utils/validation';
import { successResponse, errorResponse, createdResponse, validationErrorResponse } from '../utils/responseHelper';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return validationErrorResponse(res, 'All fields are required');
    }

    if (username.length < 3) {
      return validationErrorResponse(res, 'Username must be at least 3 characters');
    }

    if (!validateEmail(email)) {
      return validationErrorResponse(res, 'Invalid email format');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return validationErrorResponse(res, passwordValidation.message!);
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return validationErrorResponse(res, 'Email already in use');
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return validationErrorResponse(res, 'Username already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 12); // BUG FIX: Use higher salt rounds (12)
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    // BUG FIX: Safer DTO approach
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    return createdResponse(res, userResponse, 'User registered successfully');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return validationErrorResponse(res, 'Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
      return validationErrorResponse(res, 'Invalid credentials'); // BUG FIX: Generic message for security
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return validationErrorResponse(res, 'Invalid credentials'); // BUG FIX: Generic message for security
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return successResponse(res, { token, user: userResponse }, 'Login successful');
  } catch (err: any) {
    return errorResponse(res, err.message);
  }
};
