import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return 
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
      return 
    }
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
    return 
  }
}