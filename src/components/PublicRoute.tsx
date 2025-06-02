import { useEffect, type PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

export const PublicOnlyRoute = ({ children }: PropsWithChildren) => {
  const user = localStorage.getItem("user");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/friends", { replace: true });
    }
  }, [user, navigate]);

  return children;
};
