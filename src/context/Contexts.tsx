import React, { createContext, useEffect, useState } from "react";
import { connectWebSocket } from "@/utils/websoketService";
import type { User } from "@/utils/types";
import { getCurrentUser } from "@/utils/apiService";

export interface ContextType {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string|null>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
}

export const Contexts = createContext<ContextType>({
  token: "",
  setToken: () => {} ,
  user: null,
  setUser: () => {},
  isLoading: true,
});

export const ContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
   
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        console.log(data, "data context");
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    

    fetchUser();
  }, []);

  useEffect(() => {
    if (token) {
      console.log("Connecting WebSocket with token:", token);
      connectWebSocket(token);
    }
  }, [token]);

  const values: ContextType = {
    token,
    setToken,
    user,
    setUser,
    isLoading,
  };

  return <Contexts.Provider value={values}>{children}</Contexts.Provider>;
};
