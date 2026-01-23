import { createContext, useContext } from "react";

export type SocketContextValue = {
  connected: boolean;
  socketId: string | null;
  refreshCount: number;
  lastRefreshAt: number | null;
};

export const SocketContext = createContext<SocketContextValue | undefined>(
  undefined,
);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return ctx;
};