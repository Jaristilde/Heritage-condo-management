import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required for JWT signing");
}

const JWT_SECRET = process.env.SESSION_SECRET;
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  unitId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface DecodedToken extends JWTPayload {
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

export function generateToken(payload: JWTPayload, expiresIn = '90d'): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn, // ✅ Default 90 days
    issuer: 'heritage-condo',
    audience: 'heritage-owners',
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '180d' } // ✅ 6 months for refresh tokens
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function isTokenExpiringSoon(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;

    // Refresh if less than 7 days remaining
    return timeUntilExpiry < (7 * 24 * 60 * 60);
  } catch {
    return true; // Treat invalid tokens as expiring
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`❌ Auth failed: No token provided for ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    console.log(`❌ Auth failed: Invalid/expired token for ${req.path}`);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // ✅ Log successful auth with expiration info
  try {
    const decoded = jwt.decode(token) as DecodedToken;
    const expiresAt = new Date(decoded.exp * 1000);
    const daysUntilExpiry = Math.floor((decoded.exp * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

    console.log(`✅ Auth OK: ${payload.username} (role: ${payload.role}, expires in ${daysUntilExpiry} days)`);
  } catch (error) {
    // Fallback if decoding fails
    console.log(`✅ Auth OK: ${payload.username} (role: ${payload.role})`);
  }

  (req as any).user = payload;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JWTPayload;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}
