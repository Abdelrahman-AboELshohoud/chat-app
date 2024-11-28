import { createContext, useState, useEffect } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthContextType {
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
  setUser: (user: AuthContextType["user"] | null) => void;
  getMe: () => void;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState(null);

  const getMe = async () => {
    try {
      const user = await fetch("/api/auth/me");
      const userData = await user.json();

      if (userData.user) {
        setUser(userData.user);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, getMe } as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
