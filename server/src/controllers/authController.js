/**
 * @controller AuthController
 * @description Handles /api/auth routes.
 */
import AuthService from '../services/authService.js';
import { AppError } from '../middleware/errorHandler.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    res
      .cookie('refreshToken', result.refreshToken, COOKIE_OPTS)
      .status(201)
      .json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res
      .cookie('refreshToken', result.refreshToken, COOKIE_OPTS)
      .json({ success: true, data: { user: result.user, accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    // Accept from cookie (web) or body (mobile)
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await AuthService.refreshTokens(token);
    res
      .cookie('refreshToken', result.refreshToken, COOKIE_OPTS)
      .json({ success: true, data: { accessToken: result.accessToken } });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.user._id);
    res
      .clearCookie('refreshToken')
      .json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};
