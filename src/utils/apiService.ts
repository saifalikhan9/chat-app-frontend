import axios from "axios";
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
  FriendPayload,
  AuthAxiosResponse,
} from "./types";

const apiClient = axios.create({
  baseURL: "http://192.168.1.3:3001", // change to your backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token to all requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = async (data: SignupPayload): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/signup", data);
  console.log(res);
  return res.data;
};

export const login = async (data: LoginPayload): Promise<AuthAxiosResponse> => {
  const res = await apiClient.post<AuthAxiosResponse>("/login", data);
  console.log(res);

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("user", JSON.stringify(res.data?.data));
  return res.data;
};

export const logout = async () => {
  const token = localStorage.getItem("token");
  if (token) {
    localStorage.removeItem("token");
    const res = await apiClient.get("/logout");
    console.log(res);
    return res.data.response;
  }
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const res = await apiClient.get<User[]>("/getUsers");
  console.log(res);
  return res.data;
};

// Friends
export const addFriend = async (data: FriendPayload) => {
  console.log(data, "data");

  const res = await apiClient.post("/addFriends", { friendEmail: data.email });
  console.log(res);
  return res.data;
};

export const getFriends = async (): Promise<User[]> => {
  const res = await apiClient.get("/getFriends");
  console.log(res);
  return res.data;
};

export const deleteFriend = async (data: FriendPayload) => {
  const res = await apiClient.delete("/deleteFriend", { data });
  console.log(res);
  return res.data;
};

export default apiClient;
