import { useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSerieCreated: () => void;
    token: string;
}

export default function CreateSerieModal({ isOpen, onClose, onSerieCreated, token }: Props) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [genres, setGenres] = useState('');
    const [year, setYear] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [episodes, setEpisodes] = useState('');
    const [status, setStatus] = useState('En emisión');
    const [startedAt, setStartedAt] = useState('');
    const [endedAt, setEndedAt] = useState('');
    const [studio, setStudio] = useState('');
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);
    const genresArray = genres.split(',').map(g => g.trim()).filter(Boolean);
    if (!isOpen) return null;

    async function handleImageUpload(): Promise<string | null> {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Error subiendo imagen');

            const data = await res.json();
            return data.url;
        } catch (err: any) {
            toast.error(err.message || 'Error subiendo imagen');
            return null;
        }
    }

    async function handleCreate() {
        setLoading(true);

        try {
            // Validaciones requeridas
            if (!title.trim() || !description.trim() || !genre.trim() || !genres.trim() ||
                !year || !imageFile || !episodes || !status || !startedAt || !studio.trim() || !source.trim()) {
                toast.error('Todos los campos son obligatorios ');
                setLoading(false);
                return;
            }

            if (status === 'Finalizada' && !endedAt) {
                toast.error('Debes ingresar la fecha de finalización si el estado es "Finalizada".');
                setLoading(false);
                return;
            }

            if (genresArray.length > 3) {
                toast.error('Solo puedes ingresar hasta 3 géneros.');
                setLoading(false);
                return;
            }
            if (!startedAt) {
                toast.error('La fecha de inicio es obligatoria.');
                setLoading(false);
                return;
            }

            if (status === 'Finalizada') {
                if (!endedAt) {
                    toast.error('Debes ingresar la fecha de finalización si el estado es "Finalizada".');
                    setLoading(false);
                    return;
                }

                if (new Date(endedAt) < new Date(startedAt)) {
                    toast.error('La fecha de finalización no puede ser anterior a la de inicio.');
                    setLoading(false);
                    return;
                }
            }
            let finalImageUrl = imageUrl;

            if (imageFile && !imageUrl) {
                const uploadedUrl = await handleImageUpload();

                if (!uploadedUrl) {
                    toast.error('Error al subir la imagen. Intenta nuevamente.');
                    setLoading(false);
                    return;
                }

                setImageUrl(uploadedUrl);
                finalImageUrl = uploadedUrl;
            }

            const body: any = {
                title,
                description,
                genre,
                genres: genres.split(',').map(g => g.trim()),
                year: Number(year),
                imageUrl: finalImageUrl,
                episodes: Number(episodes),
                status,
                startedAt,
                studio,
                source,
            };

            // Solo envía endedAt si corresponde
            if (status === 'Finalizada') {
                body.endedAt = endedAt;
            }
            console.log('Enviando body a backend:', body);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/series/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify(body),
            });

            if (!res.ok) {

                const err = await res.json();
                throw new Error(err.error || 'Error al crear serie');
            }

            toast.success('Serie creada correctamente');
            onSerieCreated();
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Error creando la serie');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded shadow-lg text-white max-w-md w-full overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-bold mb-4">Crear nueva serie</h3>

                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Género principal" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <input value={genres} onChange={e => setGenres(e.target.value)} placeholder="Géneros (separados por coma)" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Año" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <input type="number" value={episodes} onChange={e => setEpisodes(e.target.value)} placeholder="Episodios" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full mb-2 px-3 py-2 bg-gray-700 rounded">
                    <option value="En emisión">En emisión</option>
                    <option value="Finalizada">Finalizada</option>
                </select>
                <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)} className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />

                <input
                    type="date"
                    value={endedAt}
                    onChange={e => setEndedAt(e.target.value)}
                    className="w-full mb-2 px-3 py-2 bg-gray-700 rounded"
                />

                <input value={studio} onChange={e => setStudio(e.target.value)} placeholder="Estudio" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <input value={source} onChange={e => setSource(e.target.value)} placeholder="Fuente (ej: Novela ligera)" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
                <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full mb-4 bg-gray-700 rounded" />

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancelar</button>
                    <button onClick={handleCreate} disabled={loading} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </div>
        </div>
    );
}
