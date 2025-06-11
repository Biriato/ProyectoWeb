
import { Link, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <>
      <header className="bg-blue-800 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">Mi Biblioteca</h1>
        <nav className="flex gap-4">
          <Link to="/" className="hover:underline">Inicio</Link>
          <Link to="/mis-series" className="hover:underline">Mis Series</Link>
          <Link to="/perfil" className="hover:underline">Perfil</Link>
          <button className="hover:underline hover:text-red-600" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}>
            Cerrar sesión
          </button>
        </nav>
      </header>

      <main className="p-4 min-h-[calc(100vh-64px)] bg-[#0f172a] text-white">
        <Outlet />
      </main>
    </>
  );
}
