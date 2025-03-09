import React, { createContext, useState, useContext } from "react";

// Create User Context
const UserContext = createContext();

// Custom hook to use User Context
export const useUserContext = () => useContext(UserContext);

// User Context Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Initialize with null or user object

  // Update user data (e.g., after login or logout)
  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
