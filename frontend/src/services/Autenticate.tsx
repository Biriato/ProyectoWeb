import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";


interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      try {
        const decodedUser = jwtDecode<User>(storedToken);
        setUser(decodedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Token inválido:", error);
        logout(); // limpiar si el token es inválido
      }
    }

    setIsLoading(false);
  }, []);

  const login = (tokenData: string) => {
    try {
      const decodedUser = jwtDecode<User>(tokenData);
      setUser(decodedUser);
      setToken(tokenData);
      localStorage.setItem('token', tokenData);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
