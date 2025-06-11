import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/Autenticate';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user,isLoading } = useAuth();
  if (isLoading) {
    return <div className="text-center text-white">Cargando...</div>; 
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}