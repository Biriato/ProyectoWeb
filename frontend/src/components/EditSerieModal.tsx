import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSerieUpdated: () => void;
  token: string;
  serie: Serie;
}

export default function EditSerieModal({ isOpen, onClose, onSerieUpdated, token, serie }: Props) {
  const [title, setTitle] = useState(serie.title);
  const [description, setDescription] = useState(serie.description);
  const [genre, setGenre] = useState(serie.genre);
  const [genres, setGenres] = useState(serie.genres.join(', '));
  const [year, setYear] = useState(String(serie.year));
  const [imageUrl, setImageUrl] = useState(serie.imageUrl);
  const [episodes, setEpisodes] = useState(String(serie.episodes));
  const [status, setStatus] = useState(serie.status);
  const [startedAt, setStartedAt] = useState(serie.startedAt.slice(0, 10));
  const [endedAt, setEndedAt] = useState(serie.endedAt ? serie.endedAt.slice(0, 10) : '');
  const [studio, setStudio] = useState(serie.studio);
  const [source, setSource] = useState(serie.source);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // Reiniciar a estado inicial al abrir
    setTitle(serie.title);
    setDescription(serie.description);
    setGenre(serie.genre);
    setGenres(serie.genres.join(', '));
    setYear(String(serie.year));
    setImageUrl(serie.imageUrl);
    setEpisodes(String(serie.episodes));
    setStatus(serie.status);
    setStartedAt(serie.startedAt.slice(0, 10));
    setEndedAt(serie.endedAt ? serie.endedAt.slice(0, 10) : '');
    setStudio(serie.studio);
    setSource(serie.source);
  }, [isOpen, serie]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);

    // Validaciones
    if (!title || !description || !genre || !genres || !year || !episodes || !status || !startedAt || !studio || !source) {
      toast.error('Todos los campos son obligatorios excepto Fecha de Finalización.');
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

    try {
      const payload: any = {
        title,
        description,
        genre,
        genres: genres.split(',').map(g => g.trim()),
        year: Number(year),
        imageUrl,
        episodes: Number(episodes),
        status,
        startedAt,
        studio,
        source,
        endedAt: status === 'Finalizada' ? endedAt : undefined,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/series/${serie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar serie');
      }

      toast.success('Serie actualizada correctamente');
      onSerieUpdated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error actualizando serie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-10 pb-10 z-50">
      <div className="bg-gray-800 p-6 rounded shadow-lg text-white max-w-md w-full overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-bold mb-4">Editar serie</h3>

        {/* Repite los inputs igual al CreateSerieModal, con valores controlados */}
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <input value={genre} onChange={e => setGenre(e.target.value)} placeholder="Género principal" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <input value={genres} onChange={e => setGenres(e.target.value)} placeholder="Géneros (comma-separated)" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Año" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <input type="number" value={episodes} onChange={e => setEpisodes(e.target.value)} placeholder="Episodios" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="w-full mb-2 px-3 py-2 bg-gray-700 rounded">
          <option value="En emisión">En emisión</option>
          <option value="Finalizada">Finalizada</option>
        </select>
        <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)} className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        {status === 'Finalizada' && (
          <input
            type="date"
            value={endedAt}
            onChange={e => setEndedAt(e.target.value)}
            className="w-full mb-2 px-3 py-2 bg-gray-700 rounded"
          />
        )}
        <input value={studio} onChange={e => setStudio(e.target.value)} placeholder="Estudio" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <input value={source} onChange={e => setSource(e.target.value)} placeholder="Fuente (ej: Novela ligera)" className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />
        <input value={imageUrl} placeholder="URL de imagen" readOnly className="w-full mb-2 px-3 py-2 bg-gray-700 rounded" />

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} disabled={loading} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
