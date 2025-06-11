interface DeleteModalProps {
    title: string;
    onCancel: () => void;
    onConfirm: () => void;
  }
  
  export default function DeleteModal({ title, onCancel, onConfirm }: DeleteModalProps) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md text-white">
          <h2 className="text-xl font-semibold mb-4">¿Eliminar serie?</h2>
          <p>¿Estás seguro de que deseas eliminar <strong>{title}</strong> de tu lista?</p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Cancelar
            </button>
            <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  }