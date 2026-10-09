import { loginAgent } from '../services/auth.service.js';

export async function login(req, res) {
  const { email, password } = req.validated.body;

  const data = await loginAgent({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data,
  });
}

export function me(req, res) {
  res.status(200).json({
    success: true,
    message: 'Current user',
    data: { user: req.user.toJSON() },
  });
}