import { useContext } from "react";
import { AuthContext, AuthContextType } from "./Context";

export const useAuth = () => {
  return useContext(AuthContext) as AuthContextType;
};
