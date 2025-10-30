import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { User } from '../models/types';
import { ApiError } from '../middleware/errorHandler';
import { env } from '../config/env';

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  // Check if user exists
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new ApiError(400, 'User already exists');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at, updated_at`,
    [email, password_hash, name, 'fulfillment']
  );

  return result.rows[0];
};

export const loginUser = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // Get user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const user = result.rows[0];

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate token
  const payload = { id: user.id, email: user.email, role: user.role };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  const token = jwt.sign(payload, env.JWT_SECRET, options);

  // Remove password from response
  delete user.password_hash;

  return { user, token };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, email, name, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

export const syncOAuthUser = async (email: string, name: string, supabaseId: string): Promise<{ user: User; token: string }> => {
  // Check if user exists
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  let user;

  if (existingUser.rows.length === 0) {
    // Create new OAuth user with a hashed random password they'll never use
    const oauthPassword = await bcrypt.hash(`oauth-${supabaseId}-${Date.now()}`, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at, updated_at`,
      [email, oauthPassword, name, 'fulfillment']
    );

    user = result.rows[0];
  } else {
    // User exists, just return them
    user = existingUser.rows[0];
    // Remove password from response
    delete user.password_hash;
  }

  // Generate token
  const payload = { id: user.id, email: user.email, role: user.role };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
  const token = jwt.sign(payload, env.JWT_SECRET, options);

  return { user, token };
};
