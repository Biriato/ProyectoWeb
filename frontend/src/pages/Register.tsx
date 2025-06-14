import { useState } from 'react';
import { register } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
//funcion para el registro de un usuario nuevo 
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      await register(email, password, name);
      toast.success('Registro exitoso, ahora puedes iniciar sesión');
      navigate('/login');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.errors) {
        data.errors.forEach((error: { message: string }) => {
          toast.error(error.message);
        });
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error('Error al registrarse');
      }
    }
  };

  return (
    <>
      <PageTitle title='Registro' />
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0f172a]">
        <div className="flex flex-col md:flex-row bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-full max-w-4xl min-h-[60vh]">

          {/* Imagen para pantallas grandes */}
          <div className="hidden md:flex w-full md:w-1/2 relative">
            <img
              src="/portada.jpeg"
              alt="Perfil"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-center p-4">
              <h2 className="text-2xl font-bold">Registra y administra tus series</h2>
              <p className="text-sm text-blue-100 mt-2">
                Registra y administra tus series para recordar tu progreso.
              </p>
            </div>
          </div>

          {/* Imagen superior visible solo en móvil */}
          <div className="md:hidden relative h-40 w-full overflow-hidden">
            <img
              src="/portada.jpeg"
              alt="Imagen encabezado"
              className="absolute w-full h-full object-cover object-center"
            />
          </div>

          {/* Formulario centrado verticalmente */}
          <div className="w-full md:w-1/2 bg-[#1e293b] flex items-center justify-center p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="w-full space-y-6">
              <h2 className="text-2xl font-bold text-blue-400 text-center">Registro</h2>

              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 bg-[#334155] text-white border border-[#475569] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#334155] text-white border border-[#475569] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#334155] text-white border border-[#475569] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="password"
                placeholder="Repetir Contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#334155] text-white border border-[#475569] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-200"
              >
                Registrarse
              </button>

              <p className="text-sm text-center text-white">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="text-blue-400 hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
