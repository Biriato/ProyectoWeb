import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Habilita CORS para permitir peticiones desde el frontend
app.use(cors({
  origin: "https://cheerful-naiad-7ab82c.netlify.app",
  credentials: true, 
}));

app.use(express.json());
app.use('/auth', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`);
});
