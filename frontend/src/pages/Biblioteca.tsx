import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSeries } from '../services/auth';
import axios from 'axios';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';

interface Serie {
  id: number;
  title: string;
  imageUrl: string;
  genre: string;
  genres: string[];
  year: number;
  status: string;
}

export default function Biblioteca() {
  const [series, setSeries] = useState<Serie[]>([]);
  const [page, setPage] = useState(1);
  const limit = 12;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para detectar si estamos en la última página
  const [isLastPage, setIsLastPage] = useState(false);

  // Filtros
  const [filterName, setFilterName] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [allGenres, setAllGenres] = useState<string[]>([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/appuser/series/genres`);
        setAllGenres(response.data.genres);
      } catch (error) {
        console.error('Error cargando géneros', error);
      }
    }
    fetchGenres();
  }, []);
  // Generar array de años desde 1980 hasta actual
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1980; y--) {
    years.push(y.toString());
  }

  // Resetea la página a 1 cuando cambian los filtros para evitar inconsistencias
  useEffect(() => {
    setPage(1);
  }, [filterName, filterGenre, filterYear, filterStatus]);

  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pasamos los filtros al backend para que aplique paginación + filtros
        const data = await fetchSeries(page, limit, {
          name: filterName,
          genre: filterGenre,
          year: filterYear,
          status: filterStatus,
        });

        setSeries(data.series);
        setIsLastPage(page >= data.totalPages);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Error cargando series');
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [page, filterName, filterGenre, filterYear, filterStatus]);

  return (
    <>
    <PageTitle title='Biblioteca'/>
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Biblioteca de Series</h1>

      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-black">
        <input
          type="text"
          placeholder="Buscar por nombre"
          className="p-3 rounded w-full"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />

        <select
          className="p-3 rounded w-full"
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
        >
          <option value="">Todos los géneros</option>
          {allGenres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          className="p-3 rounded w-full"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        >
          <option value="">Todos los años</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          className="p-3 rounded w-full"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Estado (todos)</option>
          <option value="Finalizada">Finalizada</option>
          <option value="En emisión">En emisión</option>
        </select>
      </div>


      {loading && <Loader/>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Lista de series sin filtro extra porque ya lo hace el backend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {series.map((serie) => (
          <Link
            to={`/series/${serie.id}`}
            key={serie.id}
            className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transform transition duration-300 shadow-md"
          >
            <div className="w-full h-64 bg-gray-900">
              <img
                src={serie.imageUrl}
                alt={serie.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-2 text-center text-white font-semibold h-16 flex items-center justify-center">
              {serie.title}
            </div>
          </Link>
        ))}
        {series.length === 0 && !loading && (
          <p className="col-span-full text-white text-center">No se encontraron series con esos filtros.</p>
        )}
      </div>

      {/* Paginación */}
      <div className="flex justify-between mt-6 text-white">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="bg-blue-600 disabled:bg-gray-500 py-2 px-4 rounded"
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button
          disabled={isLastPage}
          onClick={() => setPage((p) => p + 1)}
          className="bg-blue-600 disabled:bg-gray-500 py-2 px-4 rounded"
        >
          Siguiente
        </button>
      </div>
    </div>
    </>
  );
}
