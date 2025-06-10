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
  baseURL: "http://192.168.1.3:3001/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("here");

      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = async (data: SignupPayload): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>("/signup", data);
  console.log(res);
  return res.data;
};

export const login = async (data: LoginPayload) => {
  const res: AuthAxiosResponse = await apiClient.post("/login", data);
  console.log(res);

  localStorage.setItem("token", res.data.accessToken);
  localStorage.setItem("user", JSON.stringify(res.data.user));
  return res.data;
};

export const logout = async () => {
  localStorage.clear();
  const res = await apiClient.get("/logout");
  return res.data.response;
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
