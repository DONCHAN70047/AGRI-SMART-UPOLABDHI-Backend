import React, { createContext, useState } from 'react';

// Create the context
export const UserContext = createContext();

// Create the provider component
export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null by default

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
