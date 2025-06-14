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
  async (error) => {
    if (error.response.status === 404 && !error.config._retry) {
      error.config._retry = true;
      try {
        await generateToken();
        return apiClient(error.config);
      } catch (error) {
        console.error("token refesh failed : ", error);
      }
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

  return res.data;
};

export const logout = async () => {
  const res = await apiClient.get("/logout");
  return res.data.response;
};
export const generateToken = async () => {
  try {
    await apiClient.post("/generateToken");
  } catch (error) {
    
    console.log(error);
  }
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const res = await apiClient.get<User[]>("/getUsers");
  return res.data;
};

// Friends
export const addFriend = async (data: FriendPayload) => {
  const res = await apiClient.post("/addFriends", { friendEmail: data.email });

  return res.data;
}; 

export const getFriends = async (): Promise<User[]> => {
  const res = await apiClient.get("/getFriends");

  return res.data;
};

export const deleteFriend = async (data: FriendPayload) => {
  const res = await apiClient.delete("/deleteFriend", { data });

  return res.data;
};
export const getCurrentUser = async ()=>{
try {
    const res = await apiClient.get("/getMe")

    
  return res.data
} catch (error) {
  console.error(error)
  return error
}
}

export default apiClient;
