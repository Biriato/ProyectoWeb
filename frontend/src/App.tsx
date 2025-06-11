import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Biblioteca from './pages/Biblioteca';
import SerieDetalle from './pages/Serie';
import AuthRoute from './services/AuthRoute'; // tu componente para proteger rutas
import MainLayout from './layouts/PublicLayout';
import Perfil from './pages/Profile';
import UserList from './pages/UserList';
import TopSeries from './pages/TopSeries';
import AdminRoute from './components/AdminRoute';
import AdminUserList from './pages/AdminUsers';
import AdminSeriesList from './pages/AdminSeries';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Rutas públicas */}
        <Route index element={<Home />} />
        <Route path="top" element={<TopSeries />} />
        <Route path="biblioteca" element={<Biblioteca />} />
        <Route path="series/:id" element={<SerieDetalle />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="perfil"
          element={
            <AuthRoute>
              <Perfil />
            </AuthRoute>
          }
        />
        <Route
          path="mi-lista"
          element={
            <AuthRoute>
              <UserList />
            </AuthRoute>
          }
        />
        <Route
          path="adminU"
          element={
            <AdminRoute>
              <AdminUserList />
            </AdminRoute>
          }
        />
         <Route
          path="adminS"
          element={
            <AdminRoute>
              <AdminSeriesList />
            </AdminRoute>
          }
        />
        {/* Ruta catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
