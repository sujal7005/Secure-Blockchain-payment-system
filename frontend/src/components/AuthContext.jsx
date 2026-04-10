import { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const user = { name: "Harsh" };

  const logout = () => {
    console.log("Logout clicked");
  };

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};