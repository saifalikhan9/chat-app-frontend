import { Contexts } from "@/context/Contexts";
import { useContext, useEffect, type PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { user, isLoading } = useContext(Contexts);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/signin", { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) return null;

  return children;
};
