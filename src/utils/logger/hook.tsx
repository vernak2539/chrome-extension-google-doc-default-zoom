import { createContext, useContext } from "react";
import BrowserLogger from "./index";

const LoggerContext = createContext(new BrowserLogger());

interface LoggerProviderProps {
  children: React.ReactNode;
}

export const LoggerProvider = ({ children }: LoggerProviderProps) => {
  return (
    <LoggerContext.Provider value={new BrowserLogger()}>
      {children}
    </LoggerContext.Provider>
  );
};

export const useLogger = () => {
  return useContext(LoggerContext);
};
