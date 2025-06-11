import { useEffect, useState } from 'react';
import { useAuth } from '../services/Autenticate';
import { toast } from 'react-toastify';
import ConfirmDeleteSerieModal from '../components/ConfirmDeleteSerieModal';
import CreateSerieModal from '../components/CreateSerieModal';
import EditSerieModal from '../components/EditSerieModal';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';

interface Serie {
    id: number;
    title: string;
    description: string;
    genre: string;
    genres: string[];
    year: number;
    imageUrl: string;
    episodes: number;
    status: string;
    startedAt: string;
    endedAt?: string;
    studio: string;
    source: string;
}

export default function AdminSeriesList() {
    const { token } = useAuth();
    const [series, setSeries] = useState<Serie[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [filterName, setFilterName] = useState('');
    const [filterGenre, setFilterGenre] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [editingSerie, setEditingSerie] = useState<Serie | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    useEffect(() => {
        if (!token) return;
        fetchSeries();
    }, [token, page, filterName, filterGenre, filterYear, filterStatus]);

    async function fetchSeries() {
        setLoading(true);
        setError(null);
        try {
            const url = new URL(`${import.meta.env.VITE_API_URL}/auth/appuser/series/page/${page}/${limit}`);
            if (filterName) url.searchParams.set('name', filterName);
            if (filterGenre) url.searchParams.set('genre', filterGenre);
            if (filterYear) url.searchParams.set('year', filterYear);
            if (filterStatus) url.searchParams.set('status', filterStatus);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Error cargando series');
            const data = await res.json();

            setSeries(data.series);
            setTotalPages(data.totalPages);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    }
    async function deleteSerie(id: number) {
        if (!token) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/series/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al eliminar la serie');
            }

            toast.success('Serie eliminada correctamente');
            fetchSeries(); // Refresca la lista
        } catch (error: any) {
            toast.error(error.message || 'Error eliminando la serie');
        } finally {
            setIsDeleteModalOpen(false);
            setSelectedSerie(null);
        }
    }
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <>
        <PageTitle title='Administrar Series'/>
        <div className="p-4 bg-gray-800 rounded-md text-white">
            <h2 className="text-2xl mb-4">Administracion de Series</h2>
            <div className="mb-4 flex justify-between items-center">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
                >
                    + Añadir Serie
                </button>
            </div>
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 mb-4">
                <input value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Título" className="px-3 py-1 bg-gray-700 rounded" />
                <input value={filterGenre} onChange={e => setFilterGenre(e.target.value)} placeholder="Género" className="px-3 py-1 bg-gray-700 rounded" />
                <input value={filterYear} type="number" onChange={e => setFilterYear(e.target.value)} placeholder="Año" className="px-3 py-1 bg-gray-700 rounded" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-1 bg-gray-700 rounded">
                    <option value="">Todos los estados</option>
                    <option value="Finalizada">Finalizada</option>
                    <option value="En Emisión">En Emisión</option>
                </select>

                <button onClick={() => setPage(1)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Aplicar</button>
            </div>

            {/* Tabla */}
            {loading ? (
                <Loader/>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : series.length === 0 ? (
                <p>No hay series</p>
            ) : (
                <>
                    {/* Tabla visible solo en pantallas grandes */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full bg-gray-700 rounded">
                            <thead>
                                <tr className="bg-gray-600">
                                    <th className="py-2 px-4 text-center">ID</th>
                                    <th className="py-2 px-4 text-center">Portada</th>
                                    <th className="py-2 px-4 text-center">Título</th>
                                    <th className="py-2 px-4 text-center">Géneros</th>
                                    <th className="py-2 px-4 text-center">Año</th>
                                    <th className="py-2 px-4 text-center">Estado</th>
                                    <th className="py-2 px-4 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {series.map((s) => (
                                    <tr key={s.id} className="even:bg-gray-800">
                                        <td className="py-2 px-4 text-center">{s.id}</td>
                                        <td className="py-2 px-4 text-center">
                                            <img
                                                src={s.imageUrl}
                                                alt={s.title}
                                                className="w-20 sm:w-24 h-32 sm:h-36 object-cover rounded mx-auto"
                                            />
                                        </td>
                                        <td className="py-2 px-4 text-center">{s.title}</td>
                                        <td className="py-2 px-4 text-center">{s.genre}</td>
                                        <td className="py-2 px-4 text-center">{s.year}</td>
                                        <td className="py-2 px-4 text-center">{s.status}</td>
                                        <td className="py-2 px-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setEditingSerie(s);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 mr-1 mb-1 rounded text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSerie(s);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Tarjetas visibles solo en móvil */}
                    <div className="block sm:hidden">
                        {series.map((s) => (
                            <div key={s.id} className="bg-gray-700 rounded p-4 mb-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={s.imageUrl}
                                        alt={s.title}
                                        className="w-24 h-36 object-cover rounded"
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold">{s.title}</h3>
                                        <p className="text-sm text-gray-300">{s.genre}</p>
                                        <p className="text-sm text-gray-400">{s.year}</p>
                                        <p className="text-sm text-yellow-400">{s.status}</p>
                                        <div className="mt-2 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingSerie(s);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSerie(s);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}


            {/* Paginación */}
            <div className="mt-4 flex justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                    className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">‹ Anterior</button>
                {pageNumbers.map(pn => (
                    <button key={pn} onClick={() => setPage(pn)}
                        className={`px-3 py-1 rounded ${pn === page ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>{pn}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                    className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Siguiente ›</button>
            </div>
            {selectedSerie && (
                <ConfirmDeleteSerieModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={() => deleteSerie(selectedSerie.id)}
                    title={selectedSerie.title}
                />
            )}
            {isCreateModalOpen && (
                <CreateSerieModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSerieCreated={fetchSeries}
                    token={token!}
                />
            )}
            {editingSerie && (
                <EditSerieModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSerieUpdated={fetchSeries}
                    token={token!}
                    serie={editingSerie}
                />
            )}
        </div>
        </>
        
    );
}
