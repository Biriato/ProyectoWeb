import { useState, useEffect } from 'react';
import { useAuth } from '../services/Autenticate';
import { LogOut, Mail, User as UserIcon, Pencil, Key, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import Loader from '../components/Loader';

interface User {
  id: number;
  name: string;
  email: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function Perfil() {
  const { logout, token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Error al cargar datos de usuario');
        }

        const data: User = await res.json();
        setUser(data);
        setName(data.name);
        setEmail(data.email);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token]);

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
          data.errors.forEach((e: { message: string }) => toast.error(e.message));
        } else if (data.error) {
          toast.error(data.error);
        }
        return;
      }

      const updated = await res.json();
      setUser(updated);
      toast.success('Perfil actualizado con éxito');
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el perfil');
    }
  };
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Completa todos los campos de contraseña');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las nuevas contraseñas no coinciden');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          data.errors.forEach((e: { message: string }) => toast.error(e.message));
        } else {
          toast.error(data.error || 'Error desconocido');
        }
        return;
      }

      toast.success('Contraseña actualizada correctamente');
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error('Error al cambiar contraseña');
    }
  };
  if (loading) return <Loader/>;
  if (error) return <p className="text-red-500 text-center mt-8">{error}</p>;
  if (!user) return <p className="text-white text-center mt-8">No hay usuario autenticado.</p>;

  return (
    <>
   <PageTitle title='Perfil'/>
    <div className="flex justify-center items-center px-4 sm:px-0 min-h-[70vh]">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md text-white space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-400">Mi Perfil</h1>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <UserIcon className="text-blue-300" />
            <div className="w-full">
              <p className="text-sm text-gray-400">Nombre</p>
              {editing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1 rounded bg-gray-700 text-white"
                />
              ) : (
                <p className="text-lg font-medium">{user.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Mail className="text-blue-300" />
            <div className="w-full">
              <p className="text-sm text-gray-400">Email</p>
              {editing ? (
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1 rounded bg-gray-700 text-white"
                />
              ) : (
                <p className="text-lg font-medium">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Guardar Cambios
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setName(user.name);
                  setEmail(user.email);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <X size={18} />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <Pencil size={18} />
              Editar Datos
            </button>
          )}

          {showPasswordForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-2 text-gray-400"
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Nueva Contraseña</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Confirmar Nueva Contraseña</label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-gray-700 text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleChangePassword}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar Contraseña
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
              onClick={() => setShowPasswordForm(true)}
            >
              <Key size={18} />
              Cambiar Contraseña
            </button>
          )}


          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
