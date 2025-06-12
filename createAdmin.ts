
import bcrypt from 'bcrypt';
import { PrismaClient } from './src/generated/prisma/client';

async function main() {
  const prisma = new PrismaClient();

  const password = '988244438Aa.'; // Cambia esta contraseña por la que quieras
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Alejandro',
      email: 'alejandrovg980@gmail.com',
      password: hashedPassword,
      role: 'admin',
      list: {
        create: {}, 
      },
    },
    include: {
      list: true,
    },
  });

  console.log('Admin creado:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit();
  });
