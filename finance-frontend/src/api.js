import axios from "axios";

// One axios instance for the whole app. If the backend port/host changes,
// this is the only line that needs to change.
const api = axios.create({
  baseURL: "http://localhost:8000",
});

export default api;
