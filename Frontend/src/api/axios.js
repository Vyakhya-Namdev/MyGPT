import axios from "axios";

const api = axios.create({
    baseURL: "https://mymate-8h3j.onrender.com/api",
    withCredentials: true,
})

export default api;