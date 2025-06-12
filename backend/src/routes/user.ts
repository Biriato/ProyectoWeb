import express, { Request, Response } from 'express';
import { PrismaClient, Prisma, Status } from "@prisma/client";
import type { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { authenticateToken, AuthRequest } from '../middlewares/verifyJWT';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import { updateSeriesAverageScore } from '../utils/averageScore';
import cloudinary from '../utils/cloudinary';
import multer from 'multer';
import { MulterRequest } from '../types/file';
dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const createUserSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Email inválido"),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[a-z]/, "La contraseña debe contener una letra minúscula")
        .regex(/[A-Z]/, "La contraseña debe contener una letra mayúscula")
        .regex(/[0-9]/, "La contraseña debe contener un número")
        .regex(/[\W_]/, "La contraseña debe contener un símbolo"),
    role: z.enum(["user", "admin"]).optional(),
});
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es obligatoria"),
});
const changePasswordSchema = z.object({
    email: z.string().email("Email inválido"),
    oldPassword: z.string().min(1, "La contraseña antigua es obligatoria"),
    newPassword: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[a-z]/, "La contraseña debe contener una letra minúscula")
        .regex(/[A-Z]/, "La contraseña debe contener una letra mayúscula")
        .regex(/[0-9]/, "La contraseña debe contener un número")
        .regex(/[\W_]/, "La contraseña debe contener un símbolo"),
});
const updateProfileSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
});
const updateUserSchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'admin']).optional(),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[a-z]/, "La contraseña debe contener una letra minúscula")
        .regex(/[A-Z]/, "La contraseña debe contener una letra mayúscula")
        .regex(/[0-9]/, "La contraseña debe contener un número")
        .regex(/[\W_]/, "La contraseña debe contener un símbolo")
        .optional(),
});
const createSeriesSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    genre: z.string().optional(),
    year: z
        .number({
            required_error: 'El año es obligatorio',
            invalid_type_error: 'El año debe ser un número',
        })
        .int()
        .gte(1900, 'El año debe ser mayor a 1900')
        .lte(new Date().getFullYear(), 'El año no puede ser mayor al actual')
        .optional(),
    imageUrl: z.string().url().optional(),
    episodes: z.number().int().positive().optional(),
    status: z.enum(['En emisión', 'Finalizada']),
    startedAt: z.string().optional(),
    endedAt: z.string().nullable().optional(),
    studio: z.string().optional(),
    source: z.string().optional(),
    genres: z.array(z.string()).max(3),
});
//Generales Usuarios
router.post('/', async (req: Request, res: Response) => {
    try {
        const data = createUserSchema.parse(req.body);

        // Encriptar la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(data.password, 10);


        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: 'user',
                list: {
                    create: {},
                },
            },
            include: {
                list: true,
            },
        });

        res.status(201).json(newUser);
    } catch (error: unknown) {
        console.error('ERROR DETECTADO EN /auth:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
            return;
        }
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            res.status(400).json({ error: 'Email ya registrado' });
            return;
        }
        console.error(error);
        res.status(500).json({ error: 'Error creando usuario' });
    }
});
router.post('/login', async (req: Request, res: Response) => {
    try {
        const data = loginSchema.parse(req.body);

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            res.status(401).json({ error: 'Email o contraseña incorrectos' });
            return
        }

        // Comparar la contraseña enviada con la almacenada
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Email o contraseña incorrectos' });
            return
        }
        const jwtOptions: SignOptions = {
            expiresIn: process.env.JWT_EXPIRES_IN as unknown as SignOptions['expiresIn'],
        };

        // Login exitoso (aquí puedes generar un token JWT o lo que quieras)
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET as string,
            jwtOptions
        );

        res.json({ message: 'Login exitoso', token });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
            return
        }
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});
router.post('/change-password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const data = changePasswordSchema.parse(req.body);

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return
        }

        // Verificar contraseña antigua
        const isOldPasswordValid = await bcrypt.compare(data.oldPassword, user.password);
        if (!isOldPasswordValid) {
            res.status(401).json({ error: 'Contraseña antigua incorrecta' });
            return
        }

        // Hashear nueva contraseña
        const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

        // Actualizar contraseña en base de datos
        await prisma.user.update({
            where: { email: data.email },
            data: { password: hashedNewPassword },
        });

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
            return
        }
        console.error(error);
        res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
});
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { id: true, name: true, email: true }
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo usuario' });
    }
});
router.put('/update-profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const data = updateProfileSchema.parse(req.body);

        const updatedUser = await prisma.user.update({
            where: { id: req.user!.userId },
            data,
            select: { id: true, name: true, email: true },
        });

        res.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({ field: e.path[0], message: e.message })),
            });
            return
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            res.status(400).json({ error: 'Email ya registrado' });
            return
        }
        console.error(error);
        res.status(500).json({ error: 'Error actualizando perfil' });
    }
});
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ message: 'Sesión cerrada' });
})
router.post('/list/add-series', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const {
            seriesId,
            status,
            rating,
            startedAt,
            endedAt,
            currentEpisode
        } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'No autorizado' });
            return 
        }

        if (!seriesId || typeof seriesId !== 'number') {
            res.status(400).json({ error: 'ID de serie inválido' });
            return 
        }

        if (!['POR_VER', 'MIRANDO', 'VISTA'].includes(status)) {
            res.status(400).json({ error: 'Estado inválido' });
            return 
        }

        if (status === 'VISTA') {
            if (typeof rating !== 'number' || rating < 1 || rating > 10) {
                res.status(400).json({ error: 'La puntuación debe estar entre 1 y 10 si el estado es VISTA' });
                return 
            }
        }

        if (startedAt && isNaN(Date.parse(startedAt))) {
            res.status(400).json({ error: 'Fecha de inicio inválida' });
            return 
        }

        if (endedAt && isNaN(Date.parse(endedAt))) {
            res.status(400).json({ error: 'Fecha de finalización inválida' });
            return 
        }

        if (currentEpisode !== undefined && (typeof currentEpisode !== 'number' || currentEpisode < 0)) {
            res.status(400).json({ error: 'Número de episodio inválido' });
            return 
        }

        const list = await prisma.list.findUnique({ where: { userId } });
        if (!list) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return 
        }

        const existing = await prisma.listSeries.findUnique({
            where: {
                listId_seriesId: {
                    listId: list.id,
                    seriesId: seriesId,
                },
            },
        });

        if (existing) {
            res.status(400).json({ error: 'La serie ya está en la lista' });
            return 
        }

        const added = await prisma.listSeries.create({
            data: {
                listId: list.id,
                seriesId: seriesId,
                status,
                rating: status === 'VISTA' ? rating : null,
                startedAt: startedAt ? new Date(startedAt) : undefined,
                endedAt: endedAt ? new Date(endedAt) : undefined,
                currentEpisode,
            },
        });

        if (status === 'VISTA') {
            await updateSeriesAverageScore(seriesId);
        }

        res.status(201).json({ message: 'Serie añadida a la lista', added });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error añadiendo serie a la lista' });
    }
});
router.put('/my-list/update-series/:seriesId', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const seriesId = Number(req.params.seriesId);
        const { status, rating, startedAt, endedAt, currentEpisode } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'No autorizado' });
            return 
        }

        if (isNaN(seriesId)) {
            res.status(400).json({ error: 'ID de serie inválido' });
            return 
        }

        if (!['POR_VER', 'MIRANDO', 'VISTA'].includes(status)) {
            res.status(400).json({ error: 'Estado inválido' });
            return 
        }

        if (status === 'VISTA') {
            if (typeof rating !== 'number' || rating < 1 || rating > 10) {
                res.status(400).json({ error: 'Puntuación inválida' });
                return 
            }
        }

        if (startedAt && isNaN(Date.parse(startedAt))) {
            res.status(400).json({ error: 'Fecha de inicio inválida' });
            return 
        }

        if (endedAt && isNaN(Date.parse(endedAt))) {
            res.status(400).json({ error: 'Fecha de finalización inválida' });
            return 
        }
        if (startedAt && endedAt && new Date(endedAt) < new Date(startedAt)) {
             res.status(400).json({ error: 'La fecha de finalización no puede ser anterior a la de inicio' });
             return
            }

        if (currentEpisode !== undefined && (typeof currentEpisode !== 'number' || currentEpisode < 0)) {
            res.status(400).json({ error: 'Número de episodio inválido' });
            return 
        }

        const list = await prisma.list.findUnique({ where: { userId } });
        if (!list) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return 
        }

        const updated = await prisma.listSeries.update({
            where: {
                listId_seriesId: {
                    listId: list.id,
                    seriesId: seriesId,
                },
            },
            data: {
                status,
                rating: status === 'VISTA' ? rating : null,
                startedAt: startedAt ? new Date(startedAt) : undefined,
                endedAt: endedAt ? new Date(endedAt) : undefined,
                currentEpisode,
                
            },
        });

        if (status === 'VISTA') {
            await updateSeriesAverageScore(seriesId);
        }

        res.json({ message: 'Serie actualizada correctamente', updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error actualizando serie' });
    }
});
router.get('/my-list', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId){
        res.status(401).json({ error: 'No autenticado' });
        return 
      } 
  
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const status = req.query.status as Status | undefined;
      const skip = (page - 1) * limit;
  
      // Obtener la lista del usuario
      const list = await prisma.list.findUnique({
        where: { userId },
      });
  
      if (!list){
        res.status(404).json({ error: 'Lista no encontrada' });
        return 
      } 
  
      const whereClause = {
        listId: list.id,
        ...(status ? { status } : {}),
      };
  
      // Total de elementos con o sin filtro
      const totalCount = await prisma.listSeries.count({
        where: whereClause,
      });
  
      const listSeries = await prisma.listSeries.findMany({
        where: whereClause,
        include: {
          series: true,
        },
        skip,
        take: limit,
        orderBy: {
          id: 'desc', // puedes cambiar a otro campo como startedAt si lo prefieres
        },
      });
  
      const formattedSeries = listSeries.map(ls => ({
        id: ls.series.id,
        title: ls.series.title,
        genre: ls.series.genre,
        maxEp: ls.series.episodes,
        year: ls.series.year,
        releaseDate: ls.series.startedAt,
        imageUrl: ls.series.imageUrl,
        status: ls.status,
        rating: ls.rating,
        startedAt: ls.startedAt,
        endedAt: ls.endedAt,
        currentEpisode: ls.currentEpisode,
      }));
      res.json({
        series: formattedSeries,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          pageSize: limit,
        },
      });
      return 
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la lista de series' });
    }
  });
router.get('/my-list/all', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;
  
      if (!userId) {
        res.status(401).json({ error: 'No autenticado' });
        return 
      }
  
      const listWithSeries = await prisma.list.findUnique({
        where: { userId },
        include: {
          series: {
            include: {
              series: true,
            },
          },
        },
      });
  
      if (!listWithSeries) {
        res.status(404).json({ error: 'Lista no encontrada' });
        return 
      }
  
      const series = listWithSeries.series.map(ls => ({
        id: ls.series.id,
        title: ls.series.title,
        genre: ls.series.genre,
        maxEp: ls.series.episodes,
        year: ls.series.year,
        releaseDate: ls.series.startedAt,
        imageUrl: ls.series.imageUrl,
        status: ls.status,
        rating: ls.rating,
        startedAt: ls.startedAt,
        endedAt: ls.endedAt,
        currentEpisode: ls.currentEpisode,
      }));
  
      res.json(series);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener la lista de series' });
    }
  });
router.delete('/my-list/:seriesId', authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const seriesId = Number(req.params.seriesId);

        if (!userId) {
            res.status(401).json({ error: 'No autenticado' });
            return
        }

        if (!seriesId || isNaN(seriesId)) {
            res.status(400).json({ error: 'ID de serie inválido' });
            return
        }

        // Buscar la lista del usuario
        const userList = await prisma.list.findUnique({
            where: { userId },
        });

        if (!userList) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return
        }

        // Eliminar la relación ListSeries (lista-serie)
        await prisma.listSeries.deleteMany({
            where: {
                listId: userList.id,
                seriesId,
            },
        });
        await updateSeriesAverageScore(seriesId);
        res.json({ message: 'Serie eliminada de la lista correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la serie de la lista' });
    }
});
//Administracion Usuarios
router.post('/admin/create', authenticate, async (req: Request, res: Response) => {
    try {
        const data = createUserSchema.parse(req.body);

        // Encriptar la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const role = (req.user?.role === 'admin' && data.role) ? data.role : 'user';
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role,
                list: {
                    create: {},
                },
            },
            include: {
                list: true,
            },
        });

        res.status(201).json(newUser);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
            return
        }
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            res.status(400).json({ error: 'Email ya registrado' });
            return
        }
        console.error(error);
        res.status(500).json({ error: 'Error creando usuario' });
    }
});
router.get('/admin/users', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    try {
      const { page = '1', limit = '10', name, email, role } = req.query;
  
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;
  
      const where: any = {};
  
      if (name) {
        where.name = {
          contains: name,
          mode: 'insensitive',
        };
      }
  
      if (email) {
        where.email = {
          contains: email,
          mode: 'insensitive',
        };
      }
  
      if (role) {
        where.role = role;
      }
  
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);
  
      res.json({
        data: users,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalItems: total,
      });
  
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });
router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
        res.status(400).json({ error: 'ID inválido' });
        return
    }

    try {
        // Intentar eliminar el usuario
        await prisma.user.delete({
            where: { id: userId },
        });

        res.status(200).json({ message: `Usuario con ID ${userId} eliminado correctamente` });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Código P2025 significa que no se encontró el registro para eliminar
            if (error.code === 'P2025') {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return
            }
        }
        console.error(error);
        res.status(500).json({ error: 'Error eliminando usuario' });
    }
});
router.get('/admin/users/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'ID inválido' });
        return
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});
router.put('/admin/users/update/:id', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'ID inválido' });
        return
    }

    try {
        const data = updateUserSchema.parse(req.body);

        // Si viene password, hacer hash antes de actualizar
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        res.json(updatedUser);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
            return
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                res.status(404).json({ error: 'Usuario no encontrado' });
                return
            }
            if (error.code === 'P2002') {
                res.status(400).json({ error: 'Email ya registrado' });
                return
            }
        }
        console.error(error);
        res.status(500).json({ error: 'Error actualizando usuario' });
    }
});
//General Series
router.get('/series', async (req, res) => {
    try {
        const series = await prisma.series.findMany();
        res.json(series);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener series' });
    }
});
router.get('/series/top', async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = 15;
      const skip = (page - 1) * limit;
  
      const totalSeries = await prisma.series.count({
        where: { averageScore: { not: null } },
      });
  
      const series = await prisma.series.findMany({
        where: { averageScore: { not: null } },
        orderBy: { averageScore: 'desc' },
        skip,
        take: limit,
      });
  
      res.json({
        data: series,
        meta: {
          total: totalSeries,
          page,
          lastPage: Math.ceil(totalSeries / limit),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener series' });
    }
  });
router.get('/series/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return
    }

    try {
        const serie = await prisma.series.findUnique({ where: { id } });
        if (!serie) {
            res.status(404).json({ error: 'Serie no encontrada' });
            return
        }

        res.json(serie);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener la serie' });
    }
});
 
router.get('/appuser/series/page/:page/:limit', async (req, res) => {
    try {
      const page = Number(req.params.page);
      const limit = Number(req.params.limit);
  
      const { name, genre, year, status } = req.query;
  
      if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
        res.status(400).json({ error: 'Page y limit deben ser números enteros positivos' });
        return   
    }
        
  
      const skip = (page - 1) * limit;
  
      // Construir filtro dinámico según filtros
      const where: any = {};
      if (name) where.title = { contains: name as string, mode: 'insensitive' };
      if (genre) where.genres = { has: genre as string };  // assuming genres is array field
      if (year) where.year = Number(year);
      if (status) where.status = status;
  
      const [total, series] = await Promise.all([
        prisma.series.count({ where }),
        prisma.series.findMany({
          where,
          skip,
          take: limit,
        }),
      ]);
  
      res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        series,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener series paginadas' });
    }
  });
router.get('/appuser/series/genres', async (req, res) => {
    try {
      
      const allSeries = await prisma.series.findMany({
        select: { genres: true }
      });
  
      const genreSet = new Set<string>();
      allSeries.forEach(({ genres }) => {
        genres.forEach(g => genreSet.add(g));
      });
  
      const genres = Array.from(genreSet).sort();
  
      res.json({ genres });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener géneros' });
    }
  });
 
//Administracion series
router.post(
    '/upload',
    authenticate,
    upload.single('image'),
    async (req: MulterRequest, res: Response) => {
      try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ error: 'Acceso denegado. Solo admins pueden subir imágenes.' });
          return 
        }
  
        if (!req.file) {
            res.status(400).json({ error: 'No se envió ninguna imagen.' });
          return 
        }
  
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'series' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file!.buffer);
        });
  
        res.status(200).json({ url: (result as any).secure_url });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al subir la imagen' });
      }
    }
  );
router.post(
    '/admin/series/create',
    authenticate,
    async (req: Request, res: Response) => {
      try {
        if (req.user?.role !== 'admin') {
          res.status(403).json({ error: 'Acceso denegado' });
          return;
        }
  
        const data = createSeriesSchema.parse(req.body);
  
        const newSerie = await prisma.series.create({
          data: {
            title: data.title,
            description: data.description,
            genre: data.genre,
            year: data.year,
            imageUrl: data.imageUrl, // ya viene directo del frontend
            episodes: data.episodes,
            status: data.status,
            startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
            endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
            studio: data.studio,
            source: data.source,
            genres: data.genres,
          },
        });
  
        res.status(201).json(newSerie);
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            errors: error.errors.map(e => ({
              field: e.path[0],
              message: e.message,
            })),
          });
          return;
        }
  
        console.error(error);
        res.status(500).json({ error: 'Error al crear la serie' });
      }
    }
  );
router.put('/admin/series/:id', authenticate, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return
    }

    if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Acceso denegado' });
        return
    }

    try {
        const data = createSeriesSchema.partial().parse(req.body);

        const updatedSerie = await prisma.series.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                genre: data.genre,
                year: data.year,
                imageUrl: data.imageUrl,
                episodes: data.episodes,
                status: data.status,
                startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
                endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
                studio: data.studio,
                source: data.source,
                genres: data.genres,
            },
        });

        res.json(updatedSerie);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                errors: error.errors.map(e => ({
                    field: e.path[0],
                    message: e.message,
                })),
            });
            return
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            res.status(404).json({ error: 'Serie no encontrada' });
            return
        }

        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la serie' });
    }
});
router.delete('/admin/series/:id', authenticate, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return
    }

    if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Acceso denegado' });
        return
    }

    try {
        await prisma.series.delete({
            where: { id },
        });
        res.json({ message: 'Serie eliminada de la lista correctamente' });
        res.status(204).send();
    } catch (error: unknown) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
        ) {
            res.status(404).json({ error: 'Serie no encontrada' });
            return
        }

        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la serie' });
    }
});
export default router;
