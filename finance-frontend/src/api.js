import axios from "axios";

// One axios instance for the whole app. Reads from VITE_API_URL environment variable,
// falling back to the deployed Render backend URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://aurum-yt58.onrender.com",
});

export default api;
