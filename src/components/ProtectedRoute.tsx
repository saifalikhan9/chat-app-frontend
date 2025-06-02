import { useEffect, type PropsWithChildren } from "react";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const user = localStorage.getItem("user");
  const navigate = useNavigate();
  console.log(user, "user");
  useEffect(() => {
    if (user === null) {
      navigate("/signin", { replace: true });
    } 
  }, [user, navigate]);

  return children;
};
