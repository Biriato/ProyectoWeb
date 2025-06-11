import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { userId: number; email: string;role?: 'user' | 'admin' };
}

interface JwtPayload {
  userId: number;
  email: string;
  role?: 'user' | 'admin';
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return 
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido' });
      return 
    }

    
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded && 'email' in decoded) {
      req.user = {
        userId: (decoded as JwtPayload).userId,
        email: (decoded as JwtPayload).email,
        role: (decoded as JwtPayload).role,
      };
      next();
    } else {
      res.status(403).json({ error: 'Token inválido - formato incorrecto' });
      return 
    }
  });
}
