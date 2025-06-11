import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../services/Autenticate';
import { Mail, Menu, X } from 'lucide-react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        {/*Título */}
        <Link to="/" className="flex items-center gap-2 text-3xl font-bold text-blue-400">
          Trackd
        </Link>

        {/* Botón hamburguesa visible solo en móvil */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menú Desktop */}
        <nav className="hidden md:flex space-x-4">
          <Link to="/" className="hover:underline">Inicio</Link>
          <Link to="/biblioteca" className="hover:underline">Biblioteca</Link>
          <Link to="/top" className="hover:underline">Top Series</Link>
          {user ? (
            <>
              <Link to="/perfil" className="hover:underline">Perfil</Link>
              <Link to="/mi-lista" className="hover:underline">Mi lista</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/adminU" className="hover:underline text-yellow-400 font-semibold">
                    Administrar Usuarios
                  </Link>
                  <Link to="/adminS" className="hover:underline text-yellow-400 font-semibold">
                    Administrar Series
                  </Link>
                </>
              )}
              <button onClick={logout} className="hover:underline">Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Registro</Link>
            </>
          )}
        </nav>
      </header>

      {/* Menú Mobile */}
      <div
        className={`md:hidden overflow-hidden bg-gray-800 px-4 transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] py-4 space-y-2' : 'max-h-0 py-0'
          }`}
      >
        <nav className="flex flex-col">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="hover:underline">Inicio</Link>
          <Link to="/biblioteca" onClick={() => setIsMenuOpen(false)} className="hover:underline">Biblioteca</Link>
          <Link to="/top" onClick={() => setIsMenuOpen(false)} className="hover:underline">Top Series</Link>
          {user ? (
            <>
              <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className="hover:underline">Perfil</Link>
              <Link to="/mi-lista" onClick={() => setIsMenuOpen(false)} className="hover:underline">Mi lista</Link>
              {user.role === 'admin' && (
                <>
                  <Link to="/adminU" onClick={() => setIsMenuOpen(false)} className="hover:underline text-yellow-400 font-semibold">
                    Administrar Usuarios
                  </Link>
                  <Link to="/adminS" onClick={() => setIsMenuOpen(false)} className="hover:underline text-yellow-400 font-semibold">
                    Administrar Series
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="text-left hover:underline"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="hover:underline">Login</Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)} className="hover:underline">Registro</Link>
            </>
          )}
        </nav>
      </div>

      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-400 p-4 text-sm mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
          <p>&copy; 2025 <span className="text-white font-semibold">Trackd</span>. Todos los derechos reservados.</p>

          <a
            href="mailto:alejandrovg980@gmail.com"
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Mail size={16} />
            alejandrovg980@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}
