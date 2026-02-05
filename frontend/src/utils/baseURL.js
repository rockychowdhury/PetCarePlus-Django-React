const getBaseURL = () => {
    // 1. Prioritize Environment Variable (Local .env or Netlify Config)
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. Fallback for Production Build (if Env Var is missing)
    if (import.meta.env.MODE === 'production') {
        return 'https://impressed-billi-backenddev-e631e481.koyeb.app/api';
    }

    // 3. Default to Localhost for Development
    return 'http://127.0.0.1:8000/api';
};

export const baseURL = getBaseURL();
export const API = baseURL;