import { useEffect, useState } from 'react';
import { useAuth } from '../services/Autenticate';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL;

interface Serie {
  id: number;
  title: string;
  maxEp: number;
  currentEpisode?: number
  status: string;
  rating: number;
  startedAt?: string;
  endedAt?: string;
  releaseDate?: string;
  imageUrl?: string;
}
//Funcion solo para administradores que muestra la lista de los usuarios registrados
export default function UserList() {
  const { token } = useAuth();
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    rating: 0,
    startedAt: '',
    endedAt: '',
    currentEpisode: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<Serie | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(''); // '', 'POR_VER', etc.
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    if (!token) return;

    const fetchList = async () => {
      setLoading(true);
      try {
        const url = new URL(`${API_URL}/auth/my-list`);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('limit', '5');
        if (filterStatus) url.searchParams.set('status', filterStatus);

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Error al cargar tu lista');

        const data = await res.json();
        setSeries(data.series); // usa el array de series del nuevo formato
        setTotalPages(data.pagination.totalPages || 1);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [token, filterStatus, page]);
  function validateForm(serie: Serie) {
    const start = formData.startedAt ? new Date(formData.startedAt) : null;
    const end = formData.endedAt ? new Date(formData.endedAt) : null;
    const release = serie.releaseDate ? new Date(serie.releaseDate) : null;

    if (start && end && start > end) {
      toast.error('La fecha de inicio no puede ser mayor que la de fin.');
      return false;
    }

    if (formData.status === 'VISTA') {
      if (formData.currentEpisode !== serie.maxEp) {
        toast.error('Debes haber visto todos los episodios para marcar como vista.');
        return false;
      }
      if (!formData.startedAt || !formData.endedAt) {
        toast.error('Debes ingresar las fechas de inicio y fin.');
        return false;
      }
      if (formData.rating < 1 || formData.rating > 10) {
        toast.error('La nota debe estar entre 1 y 10.');
        return false;
      }
    }

    if (formData.status === 'MIRANDO' && !formData.startedAt) {
      toast.error('Debes ingresar la fecha de inicio.');
      return false;
    }

    if (formData.status !== 'VISTA' && formData.rating > 0) {
      toast.error('No puedes calificar una serie que no has visto.');
      return false;
    }

    if (formData.currentEpisode > serie.maxEp) {
      toast.error(`El último episodio es ${serie.maxEp}.`);
      return false;
    }

    if (start && release && start < release) {
      toast.error('La fecha de inicio no puede ser anterior a la fecha de estreno.');
      return false;
    }

    if (end && release && end < release) {
      toast.error('La fecha de fin no puede ser anterior a la fecha de estreno.');
      return false;
    }

    return true;
  }
  if (token === null) {
    return <p className="text-white text-center mt-8">Verificando sesión...</p>;
  }

  if (loading) return <Loader/>;
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;

  return (
 <>
 <PageTitle title='Mi Lista'/>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-blue-400">
        Mi Lista de Series
      </h1>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
        {['', 'POR_VER', 'MIRANDO', 'VISTA'].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              setPage(1); // Reinicia a página 1 cuando se cambia filtro
            }}
            className={`px-3 py-2 rounded font-semibold text-sm w-full sm:w-auto ${filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {status === '' ? 'Todos' : status}
          </button>
        ))}
      </div>
      {series.length === 0 ? (
        <p className="text-center text-gray-300">No has agregado ninguna serie a tu lista.</p>
      ) : (
        <div className="space-y-6">
          {series.map((serie) => (
            <div
              key={serie.id}
              className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-800 rounded-lg shadow border border-gray-700"
            >
              <img
                src={serie.imageUrl}
                alt={serie.title}
                className="w-full sm:w-24 sm:h-36 object-cover rounded" />

              {editingId === serie.id ? (
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-bold text-blue-300">{serie.title}</h2>

                  <label className="block text-sm text-gray-300">
                    Estado:
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        const newStatus = e.target.value;

                        if (newStatus === 'POR_VER') {
                          setFormData({
                            status: 'POR_VER',
                            rating: 0,
                            currentEpisode: 0,
                            startedAt: '',
                            endedAt: '',
                          });
                        } else if (newStatus === 'MIRANDO') {
                          setFormData((prev) => ({
                            ...prev,
                            status: 'MIRANDO',
                            endedAt: '',
                          }));
                        } else if (newStatus === 'VISTA') {
                          setFormData((prev) => ({
                            ...prev,
                            status: 'VISTA',
                            rating: prev.rating || 1,
                            currentEpisode: serie.maxEp,
                          }));
                        }
                      }}
                      className="bg-gray-700 text-white rounded mt-1 block w-full"
                    >
                      <option value="POR_VER">Por ver</option>
                      <option value="MIRANDO">Mirando</option>
                      <option value="VISTA">Vista</option>
                    </select>
                  </label>

                  {formData.status === 'VISTA' && (
                    <label className="block text-sm text-gray-300">
                      Nota:
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.rating || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          rating: parseInt(e.target.value) || 0,
                        })}
                        className="bg-gray-700 text-white rounded mt-1 block w-full" />
                    </label>
                  )}

                  <label className="block text-sm text-gray-300">
                    Inicio:
                    <input
                      type="date"
                      value={formData.startedAt}
                      disabled={formData.status === 'POR_VER'}
                      required={formData.status === 'MIRANDO' || formData.status === 'VISTA'}
                      onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
                      className={`bg-gray-700 text-white rounded mt-1 block w-full ${formData.status === 'POR_VER' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </label>

                  <label className="block text-sm text-gray-300">
                    Fin:
                    <input
                      type="date"
                      value={formData.endedAt}
                      disabled={formData.status !== 'VISTA'}
                      required={formData.status === 'VISTA'}
                      onChange={(e) => setFormData({ ...formData, endedAt: e.target.value })}
                      className={`bg-gray-700 text-white rounded mt-1 block w-full ${formData.status !== 'VISTA' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </label>

                  <label className="block text-sm text-gray-300">
                    Episodio actual:
                    <input
                      type="number"
                      value={formData.currentEpisode ?? 0}
                      disabled={formData.status === 'VISTA' || formData.status === 'POR_VER'}
                      onChange={(e) => {
                        const ep = parseInt(e.target.value, 10);
                        setFormData({
                          ...formData,
                          currentEpisode: isNaN(ep) ? 0 : ep,
                        });
                      }}
                      className={`bg-gray-700 text-white rounded mt-1 block w-full ${formData.status === 'VISTA' ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </label>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        try {

                          if (!validateForm(serie)) return;


                          const res = await fetch(`${API_URL}/auth/my-list/update-series/${serie.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify(formData),
                          });

                          if (!res.ok) throw new Error('Error al actualizar');

                          // Actualiza el estado local
                          setSeries((prev) => prev.map((s) => s.id === serie.id ? { ...s, ...formData } : s
                          )
                          );
                          setEditingId(null);
                        } catch (err) {
                          alert('Error al guardar');
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-blue-300">{serie.title}</h2>
                  <p className='text-sm text-gray-400'>
                    Episodio: {serie.currentEpisode ?? 0}/ {serie.maxEp}
                  </p>
                  <p className="text-sm text-gray-400">Estado: {serie.status}</p>
                  <p className="text-sm text-gray-400">Nota: {serie.rating}/10</p>
                  {serie.startedAt && (
                    <p className="text-sm text-gray-400">
                      Inicio: {new Date(serie.startedAt).toLocaleDateString()}
                    </p>
                  )}
                  {serie.endedAt && (
                    <p className="text-sm text-gray-400">
                      Fin: {new Date(serie.endedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {editingId !== serie.id && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => {
                      setEditingId(serie.id);
                      setFormData({
                        status: serie.status || '',
                        rating: serie.rating || 0,
                        startedAt: serie.startedAt?.slice(0, 10) || '',
                        endedAt: serie.endedAt?.slice(0, 10) || '',
                        currentEpisode: serie.status === 'VISTA' ? serie.maxEp : serie.currentEpisode ?? 0,
                      });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 w-full rounded"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedToDelete(serie);
                      setShowModal(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 w-full rounded"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showModal && selectedToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4 text-white">
            <h2 className="text-xl font-semibold mb-4">¿Eliminar serie?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar <strong>{selectedToDelete.title}</strong> de tu lista?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedToDelete(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/auth/my-list/${selectedToDelete.id}`, {
                      method: 'DELETE',
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    });

                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error || 'Error al eliminar la serie');
                    }

                    setSeries((prev) => prev.filter((s) => s.id !== selectedToDelete.id));
                    toast.success('Serie eliminada de tu lista');
                  } catch (err: any) {
                    toast.error(`Error: ${err.message}`);
                  } finally {
                    setShowModal(false);
                    setSelectedToDelete(null);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {totalPages >= 1 && (
        <div className="flex flex-wrap justify-center items-center gap-2  sm:gap-4 mt-6 text-sm sm:text-base">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>

          <span className="text-gray-300">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 disabled:bg-gray-700 text-white rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
    </>
  );
}
