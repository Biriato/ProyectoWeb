import { useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { fetchSerieById } from '../services/auth';
import { toast } from 'react-toastify';
import { useAuth } from '../services/Autenticate';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';

interface Serie {
    id: number;
    title: string;
    description: string;
    genre: string;
    year: number;
    imageUrl: string;
    episodes: number;
    status: string;
    startedAt: string;
    endedAt: string;
    studio: string;
    source: string;
    genres: string[];
    averageScore: number | null;
}
//Pagina especificada de cada serie en la que se cargan todos sus datos 
export default function SerieDetalle() {
    const { id } = useParams<{ id: string }>();
    const [serie, setSerie] = useState<Serie | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [status, setStatus] = useState<'POR_VER' | 'MIRANDO' | 'VISTA'>('POR_VER');
    const [rating, setRating] = useState<number>(1);
    const [startedAt, setStartedAt] = useState<string>('');
    const [endedAt, setEndedAt] = useState<string>('');
    const [currentEpisode, setCurrentEpisode] = useState<number>(0);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (!id) return;

        const loadSerie = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchSerieById(Number(id));
                setSerie(data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Error cargando la serie');
                toast.error(err.response?.data?.error || 'Error cargando la serie');
            } finally {
                setLoading(false);
            }
        };

        loadSerie();
    }, [id]);

    const handleModalOpen = () => {
        if (!token) {
            toast.info('Debes iniciar sesión para agregar una serie a tu lista');
            return;
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const errors: { [key: string]: string } = {};
        const today = new Date().toISOString().split('T')[0];

        if (status !== 'POR_VER') {
            errors.startedAt = 'La fecha de inicio es obligatoria.';
        } else if (startedAt > today) {
            errors.startedAt = 'La fecha de inicio no puede ser en el futuro.';
        }

        if (status === 'VISTA') {
            if (!endedAt) {
                errors.endedAt = 'La fecha de finalización es obligatoria.';
            } else if (endedAt < startedAt) {
                errors.endedAt = 'La fecha de finalización no puede ser anterior a la de inicio.';
            }
            if (!rating || rating < 1 || rating > 10) {
                errors.rating = 'La nota debe estar entre 1 y 10.';
            }
        }

        if (status !== 'POR_VER') {
            const maxEpisodes = serie?.episodes || 0;
            if (currentEpisode < 0) {
                errors.currentEpisode = 'El episodio actual no puede ser negativo.';
            } else if (currentEpisode > maxEpisodes) {
                errors.currentEpisode = `No puede ser mayor que ${maxEpisodes}.`;
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error('Por favor corrige los errores del formulario.');
            return;
        }

        // Limpiar errores
        setFormErrors({});

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/list/add-series`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    seriesId: serie?.id,
                    status,
                    rating: status === 'VISTA' ? rating : undefined,
                    startedAt: startedAt || undefined,
                    endedAt: status === 'VISTA' && endedAt ? endedAt : undefined,
                    currentEpisode: status !== 'POR_VER' ? currentEpisode : undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al agregar la serie');
            }

            toast.success('Serie añadida a tu lista');
            setIsModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Error al agregar la serie');
        }
    };

    if (loading) return <Loader/>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!serie) return <p className="text-white">Serie no encontrada</p>;

    const startedDate = new Date(serie.startedAt).toLocaleDateString();
    const endedDate = serie.endedAt ? new Date(serie.endedAt).toLocaleDateString() : 'En emisión';

    return (
        <>
       <PageTitle title={serie.title}/>
        <div className="max-w-4xl mx-auto p-4 text-white bg-gray-900 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-bold">{serie.title}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col max-w-xs">
                    <img
                        src={serie.imageUrl}
                        alt={serie.title}
                        className="rounded-lg max-w-full max-h-[400px] object-contain"
                    />
                    <div className="mt-4 grid grid-cols-1 gap-4 text-gray-300">
                        <div><strong>Género:</strong> {serie.genre}</div>
                        <div><strong>Fuente:</strong> {serie.source}</div>
                        <div><strong>Estado:</strong> {serie.status}</div>
                        <div><strong>Año:</strong> {serie.year}</div>
                        <div><strong>Episodios:</strong> {serie.episodes}</div>
                        <div><strong>Estudio:</strong> {serie.studio}</div>
                        <div><strong>Fecha inicio:</strong> {startedDate}</div>
                        <div><strong>Fecha finalización:</strong> {endedDate}</div>
                        <div><strong>Géneros:</strong> {serie.genres.join(', ')}</div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-lg text-gray-300 font-medium">Nota media de los usuarios:</span>
                            <div className="flex items-center gap-1">
                                <svg
                                    className="w-7 h-7 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.946a1 1 0 00.95.69h4.14c.969 0 1.371 1.24.588 1.81l-3.356 2.44a1 1 0 00-.364 1.118l1.286 3.946c.3.921-.755 1.688-1.538 1.118l-3.356-2.44a1 1 0 00-1.176 0l-3.356 2.44c-.783.57-1.838-.197-1.538-1.118l1.286-3.946a1 1 0 00-.364-1.118L2.084 9.373c-.783-.57-.38-1.81.588-1.81h4.14a1 1 0 00.95-.69l1.286-3.946z" />
                                </svg>
                                <span className="text-yellow-400 font-bold text-3xl">
                                    {serie.averageScore ?? 'N/A'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleModalOpen}
                            className="bg-green-600 hover:bg-green-700 rounded px-4 py-2 font-semibold transition self-start sm:self-auto"
                        >
                            Añadir a mi lista
                        </button>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">Sinopsis</h2>
                    <p className="text-gray-300">{serie.description}</p>
                </div>
            </div>

            {/* MODAL */}
            <Transition show={isModalOpen} as={Fragment}>
                <Dialog onClose={() => setIsModalOpen(false)} className="relative z-50">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4 min-h-screen">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="scale-95 opacity-0"
                            enterTo="scale-100 opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="scale-100 opacity-100"
                            leaveTo="scale-95 opacity-0"
                        >
                            <Dialog.Panel className="bg-gray-800 text-white p-6 rounded-lg max-w-md w-full space-y-4 shadow-xl border border-gray-700">
                                <Dialog.Title className="text-xl font-semibold">Añadir serie a tu lista</Dialog.Title>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">Estado</label>
                                    <select
                                        value={status}
                                        onChange={(e) => {
                                            const newStatus = e.target.value as 'POR_VER' | 'MIRANDO' | 'VISTA';
                                            setStatus(newStatus);

                                            if (newStatus === 'VISTA') {
                                                const maxEpisodes = serie?.episodes || 0;
                                                setCurrentEpisode(maxEpisodes);
                                                const today = new Date().toISOString().split('T')[0];
                                                setEndedAt(today);
                                            } else {
                                                setEndedAt('');
                                            }
                                        }}
                                        className="w-full rounded bg-gray-900 border border-gray-600 p-2"
                                    >
                                        <option value="POR_VER">Por ver</option>
                                        <option value="MIRANDO">Mirando</option>
                                        <option value="VISTA">Vista</option>
                                    </select>
                                </div>

                                {status === 'VISTA' && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Nota (1-10)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            max={10}
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="w-full rounded bg-gray-900 border border-gray-600 p-2"
                                        />
                                        {formErrors.startedAt && <p className="text-red-500 text-sm mt-1">{formErrors.rating}</p>}
                                    </div>
                                )}
                                {(status === 'VISTA' || status === 'MIRANDO') && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Fecha de inicio</label>
                                        <input
                                            type="date"
                                            value={startedAt}
                                            onChange={(e) => setStartedAt(e.target.value)}
                                            className="w-full rounded bg-gray-900 border border-gray-600 p-2"
                                        />
                                        {formErrors.startedAt && <p className="text-red-500 text-sm mt-1">{formErrors.startedAt}</p>}
                                    </div>
                                )}
                                {status === 'VISTA' && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Fecha de finalización</label>
                                        <input
                                            type="date"
                                            value={endedAt}
                                            onChange={(e) => setEndedAt(e.target.value)}
                                            className="w-full rounded bg-gray-900 border border-gray-600 p-2"
                                        />
                                        {formErrors.startedAt && <p className="text-red-500 text-sm mt-1">{formErrors.endedAt}</p>}
                                    </div>
                                )}
                                {status !== 'POR_VER' && (
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Episodio actual</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={serie?.episodes || undefined}
                                            value={currentEpisode}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                const maxEpisodes = serie?.episodes || 0;

                                                if (value > maxEpisodes) {
                                                    toast.warn(`No puedes introducir un número mayor que ${maxEpisodes}`);
                                                    return;
                                                }

                                                setCurrentEpisode(value);

                                                // Si el usuario llegó al último episodio, actualizamos el estado a VISTA
                                                if (value === maxEpisodes && status !== 'VISTA') {
                                                    setStatus('VISTA');
                                                    const today = new Date().toISOString().split('T')[0];
                                                    setEndedAt(today);
                                                    toast.info('Has completado la serie. Estado actualizado a VISTA.');
                                                }
                                            }}
                                            className="w-full rounded bg-gray-900 border border-gray-600 p-2"
                                        />
                                        {formErrors.startedAt && <p className="text-red-500 text-sm mt-1">{formErrors.currentEpisode}</p>}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Confirmar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition>

        </div>
        </>
    );
}
