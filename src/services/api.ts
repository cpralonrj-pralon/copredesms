import axios from 'axios';
import { supabase } from '../lib/supabase';

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: apiUrl,
});

// Interceptor para injetar o token JWT do Supabase em todas as chamadas para o backend
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
});

export default api;
