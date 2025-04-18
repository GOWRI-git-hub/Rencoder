
import React, { createContext, useContext } from "react";

const currentIP = process.env.EXPO_PUBLIC_IP;

const IPContext = createContext(currentIP);

export const IPProvider = ({ children }) => (
    <IPContext.Provider value={currentIP}>
        {children}
    </IPContext.Provider>
);

export const useIP = () => useContext(IPContext);
