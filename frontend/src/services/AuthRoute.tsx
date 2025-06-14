import { Navigate } from 'react-router-dom';
import { useAuth } from './Autenticate';
import type { JSX } from 'react';
import Loader from '../components/Loader';
//Funcion para verificar usuario en recargas de pagina 
export default function AuthRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loader/>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}