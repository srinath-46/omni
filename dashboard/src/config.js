// Central config — reads backend URL from env var (set in Render dashboard)
// In development: VITE_BACKEND_URL is empty so it falls back to localhost:3001
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default BACKEND_URL;
