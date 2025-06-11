import { PrismaClient } from "../generated/prisma/client";


const prisma = new PrismaClient();

/**
 * Recalcula y actualiza el promedio de puntuaciones de una serie
 * @param seriesId ID de la serie a actualizar
 */
export async function updateSeriesAverageScore(seriesId: number): Promise<void> {
  // Obtiene todos los ratings (no nulos) asociados a la serie
  const ratings = await prisma.listSeries.findMany({
    where: {
      seriesId,
      rating: {
        not: null,
      },
    },
    select: {
      rating: true,
    },
  });

  if (ratings.length === 0) {
    // Si no hay puntuaciones, deja el campo en null
    await prisma.series.update({
      where: { id: seriesId },
      data: {
        averageScore: null,
      },
    });
    return;
  }

  // Calcula el promedio
  const total = ratings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
  const average = parseFloat((total / ratings.length).toFixed(2)); // Redondea a 2 decimales

  // Actualiza la serie
  await prisma.series.update({
    where: { id: seriesId },
    data: {
      averageScore: average,
    },
  });
}