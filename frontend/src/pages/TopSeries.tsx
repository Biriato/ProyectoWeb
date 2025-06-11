import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/Autenticate';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';


interface Serie {
  id: number;
  title: string;
  imageUrl: string;
  year: number;
  episodes: number;
  averageScore: number | null;
  genres: string[];
}

interface ApiResponse {
  data: Serie[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

const SERIES_PER_PAGE = 15;

export default function TopSeries() {
  const { user, token } = useAuth(); // Aquí obtienes user y token
  const [series, setSeries] = useState<Serie[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userScores, setUserScores] = useState<Record<number, number>>({});

  // Carga top series paginadas
  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/series/top?page=${page}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Error cargando series');
        }
        const json: ApiResponse = await res.json();
        setSeries(json.data);
        setLastPage(json.meta.lastPage);
      } catch (error: any) {
        toast.error(error.message || 'Error cargando series');
      } finally {
        setLoading(false);
      }
    };
    loadSeries();
  }, [page]);

  // Carga lista del usuario para obtener sus notas SOLO si está logueado
  useEffect(() => {
    if (!user || !token) {
      setUserScores({});
      return;
    }

    const loadUserList = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/my-list/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Error cargando la lista del usuario');
        }
        const userSeries = await res.json();

        // Construir un objeto { serieId: rating }
        const scoresMap: Record<number, number> = {};
        userSeries.forEach((serie: any) => {
          if (serie.rating !== null) {
            scoresMap[serie.id] = serie.rating;
          }
        });
        setUserScores(scoresMap);
      } catch (error: any) {
        toast.error(error.message || 'Error cargando la lista del usuario');
      }
    };

    loadUserList();
  }, [user, token]);

  return (
    <>
    <PageTitle title='Top Series'/>
    <div className="max-w-6xl mx-auto p-4 text-white bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6 text-center sm:text-left">Top Series por Nota</h1>

      {/* Encabezado solo visible en pantallas sm o mayores */}
      <div className="hidden sm:grid grid-cols-[150px_1fr_100px_130px] gap-3 border-b-2 border-gray-700 pb-2 mb-4 text-gray-400 font-semibold select-none text-center">
        <div className="flex flex-col items-center">Posición</div>
        <div className="text-left">Datos</div>
        <div>Nota Media</div>
        <div>Tu Nota</div>
      </div>

      {loading ? (
        <Loader/>
      ) : (
        <div className="space-y-4">
          {series.map((serie, index) => {
            const globalRank = (page - 1) * SERIES_PER_PAGE + index + 1;

            return (
              <div
                key={serie.id}
                className="sm:grid sm:grid-cols-[120px_1fr_100px_120px] grid-cols-1 gap-3 p-4 rounded border border-gray-700 bg-gray-800"
              >
                {/* Mobile version */}
                <div className="sm:hidden flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <img
                      src={serie.imageUrl}
                      alt={serie.title}
                      className="w-20 h-32 rounded object-cover"
                    />
                    <div>
                      <Link
                        to={`/series/${serie.id}`}
                        className="text-lg font-semibold text-blue-400 hover:underline"
                      >
                        {serie.title}
                      </Link>
                      <div className="text-sm text-gray-400">
                        <div>Año: {serie.year}</div>
                        <div>Episodios: {serie.episodes}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span className="font-medium">#{globalRank}</span>
                    <span>
                      Media:{' '}
                      <strong>{serie.averageScore !== null ? serie.averageScore.toFixed(1) : 'N/A'}</strong>
                    </span>
                    <span>
                      Tu Nota:{' '}
                      <strong>{user && userScores[serie.id] !== undefined ? userScores[serie.id] : 'N/A'}</strong>
                    </span>
                  </div>
                </div>

                {/* Desktop version */}
                <div className="hidden sm:flex flex-col items-center gap-2 justify-center">
                  <div className="font-bold text-4xl">#{globalRank}</div>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                  <img
                    src={serie.imageUrl}
                    alt={serie.title}
                    className="w-20 h-32 rounded object-cover"
                  />
                  <div>
                    <Link
                      to={`/series/${serie.id}`}
                      className="text-lg font-semibold text-blue-400 hover:underline"
                    >
                      {serie.title}
                    </Link>
                    <div className="text-sm text-gray-400">
                      <div>Año: {serie.year}</div>
                      <div>Episodios: {serie.episodes}</div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex justify-center items-center text-center font-semibold text-lg">
                  {serie.averageScore !== null ? serie.averageScore.toFixed(1) : 'N/A'}
                </div>

                <div className="hidden sm:flex justify-center items-center text-center font-semibold text-lg">
                  {user && userScores[serie.id] !== undefined ? userScores[serie.id] : 'N/A'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {page} de {lastPage}
        </span>
        <button
          disabled={page === lastPage}
          onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
          className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
    </>
  );
}
