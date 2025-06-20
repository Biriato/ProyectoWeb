import axios from 'axios';
//Constante para llamar a los endpoints del backend
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export default api;