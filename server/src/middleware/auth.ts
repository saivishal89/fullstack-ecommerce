import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { AppError } from '../utils/appError.js';
import { prisma } from '../config/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { name?: string };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, name: true },
    });

    if (!user || !user.isActive) {
      return next(new AppError('User not found or account deactivated.', 401));
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as 'USER' | 'ADMIN',
      name: user.name,
    };

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401));
  }
  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Access forbidden: Administrator privileges required.', 403));
  }
  next();
}
