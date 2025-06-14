import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  token: string;
  onUserUpdated: () => void;
}
//Modal para editar un usuario
export default function EditUserModal({ isOpen, onClose, user, token, onUserUpdated }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/users/update/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          role,
          ...(password && { password }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          data.errors.forEach((err: any) => toast.error(err.message));
        } else {
          toast.error(data.error || 'Error al actualizar usuario');
        }
        return;
      }

      toast.success('Usuario actualizado correctamente');
      onUserUpdated();
      onClose();
    } catch (err) {
      toast.error('Error al enviar datos');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-lg text-white space-y-4 w-full max-w-md"
      >
        <h3 className="text-xl font-bold">Editar Usuario</h3>
        <input
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
          required
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
        >
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
        <input
          type="password"
          placeholder="Nueva contraseña (opcional)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 rounded"
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">
            Cancelar
          </button>
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
