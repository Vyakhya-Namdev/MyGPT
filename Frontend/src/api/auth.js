import api from "./api";

//Regsiter
export const register = async(email, password) => {
    const res = await api.post("/auth/register", { email, password });
    return res.data;
};

//Login
export const login = async(email, password) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
}

//Logout
export const logout = async() => {
    const res = await api.post("/auth/logout");
    return res.data;
}