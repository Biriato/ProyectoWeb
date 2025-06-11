
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
  }
  
  export default function ConfirmDeleteSerieModal({ isOpen, onClose, onConfirm, title }: Props) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
        <div className="bg-gray-800 p-6 rounded shadow-lg text-white max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            ¿Estás seguro de eliminar la serie<span className="text-red-400"> {title}</span>?
          </h3>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  }