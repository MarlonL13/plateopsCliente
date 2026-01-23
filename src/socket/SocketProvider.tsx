import { useEffect, useMemo, useState } from "react";
import { socket } from "./index";
import { SocketContext, type SocketContextValue } from "./socketContext";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connected, setConnected] = useState(socket.connected);
  const [socketId, setSocketId] = useState<string | null>(socket.id ?? null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setSocketId(socket.id ?? null);
    };
    const handleDisconnect = () => {
      setConnected(false);
      setSocketId(null);
    };
    const handleRefresh = () => {
      setRefreshCount((count) => count + 1);
      setLastRefreshAt(Date.now());
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("refresh", handleRefresh);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("refresh", handleRefresh);
    };
  }, []);

  const value = useMemo<SocketContextValue>(
    () => ({ connected, socketId, refreshCount, lastRefreshAt }),
    [connected, socketId, refreshCount, lastRefreshAt],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};