import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  token: string;
}

export default function CreateUserModal({ isOpen, onClose, onUserCreated, token }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (name.trim().length < 2) newErrors.name = 'El nombre es muy corto';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo inválido';
    if (password.length < 6) newErrors.password = 'Contraseña mínima de 6 caracteres';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/admin/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          result.errors.forEach((err: any) => toast.error(err.message));
        } else {
          toast.error(result.error || 'Error desconocido');
        }
        return;
      }

      toast.success('Usuario creado correctamente');
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
      setErrors({});
      onClose();
      onUserCreated(); // recargar usuarios
    } catch (err) {
      toast.error('Error de red al crear usuario');
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-gray-800 p-6 rounded-md w-full max-w-md text-white space-y-4">
            <Dialog.Title className="text-lg font-bold">Crear nuevo usuario</Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded"
                />
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded"
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 bg-gray-700 rounded"
                />
                {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full p-2 bg-gray-700 rounded"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="bg-gray-600 px-4 py-2 rounded">
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded">
                  Crear
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
