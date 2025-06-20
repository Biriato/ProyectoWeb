import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './services/Autenticate';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={2000} />
    </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
