import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const register = async (email: string, password: string, name: string) => {
  const response = await axios.post(`${API_URL}/auth`, {
    email,
    password,
    name,
  });
  return response.data;
};
export const getProfile = async (token: string) => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export async function fetchSeries(page: number, limit: number, filters: {
  name?: string,
  genre?: string,
  year?: string,
  status?: string,
}) {
  const params: any = { page, limit };

  if (filters.name) params.name = filters.name;
  if (filters.genre) params.genre = filters.genre;
  if (filters.year) params.year = filters.year;
  if (filters.status) params.status = filters.status;

  // Usa params para hacer query string
  const response = await axios.get(`${API_URL}/auth/appuser/series/page/` + page + '/' + limit, { params });
  return response.data;
}

export const fetchSerieById = async (id: number) => {
  const response = await axios.get(`${API_URL}/auth/series/${id}`);
  return response.data;
};

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const token = localStorage.getItem('token');

  const response = await axios.post(`${API_URL}/auth/api/admin/create`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
