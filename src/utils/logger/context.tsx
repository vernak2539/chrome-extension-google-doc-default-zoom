import { createContext, useContext } from "react";
import BrowserLogger from "./index";

export const LoggerContext = createContext(new BrowserLogger("popup"));

interface LoggerProviderProps {
  children: React.ReactNode;
}

export const LoggerProvider = ({ children }: LoggerProviderProps) => {
  return (
    <LoggerContext.Provider value={new BrowserLogger("popup")}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = () => {
  return useContext(LoggerContext);
};
