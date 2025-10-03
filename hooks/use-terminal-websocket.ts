import { useCallback, useEffect, useRef, useState } from "react";
import { useHostUrl } from "./use-host-url";

/**
 * Terminal message types
 */
export interface TerminalMessage {
  type: "execute" | "cancel" | "stdout" | "stderr" | "exit" | "error";
  command?: string;
  data?: string;
  code?: number;
  message?: string;
}

/**
 * Terminal output entry
 */
export interface TerminalOutputEntry {
  text: string;
  type: "command" | "stdout" | "stderr" | "error";
}

/**
 * WebSocket connection states
 */
export type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

/**
 * Hook for managing terminal WebSocket connection
 */
export function useTerminalWebSocket() {
  const { url } = useHostUrl();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [isExecuting, setIsExecuting] = useState(false);
  const [outputEntries, setOutputEntries] = useState<TerminalOutputEntry[]>([]);

  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2 seconds

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!url) {
      console.log("No URL configured, cannot connect to WebSocket");
      return;
    }

    // Convert HTTP(S) URL to WS(S) URL
    const wsUrl = url.replace(/^http/, "ws") + "/terminal/ws";

    console.log("Connecting to WebSocket:", wsUrl);
    setConnectionState("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionState("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: TerminalMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("error");
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        setConnectionState("disconnected");
        setIsExecuting(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      setConnectionState("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionState("disconnected");
    setIsExecuting(false);
  }, []);

  /**
   * Send a message to the server
   */
  const sendMessage = useCallback((message: TerminalMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
      addOutputEntry("Error: Not connected to server", "error");
    }
  }, []);

  /**
   * Execute a command
   */
  const executeCommand = useCallback(
    (command: string) => {
      if (!command.trim()) return;

      // Add command to output
      addOutputEntry(`> ${command}`, "command");

      // Set executing state
      setIsExecuting(true);

      // Send execute message
      sendMessage({ type: "execute", command });
    },
    [sendMessage]
  );

  /**
   * Cancel the current command
   */
  const cancelCommand = useCallback(() => {
    sendMessage({ type: "cancel" });
  }, [sendMessage]);

  /**
   * Handle incoming messages from server
   */
  const handleMessage = (message: TerminalMessage) => {
    switch (message.type) {
      case "stdout":
        if (message.data) {
          // Trim trailing newlines to avoid extra blank lines
          addOutputEntry(message.data.replace(/\n+$/, ""), "stdout");
        }
        break;

      case "stderr":
        if (message.data) {
          // Trim trailing newlines to avoid extra blank lines
          addOutputEntry(message.data.replace(/\n+$/, ""), "stderr");
        }
        break;

      case "exit":
        setIsExecuting(false);
        // Optionally show exit code
        if (message.code !== undefined && message.code !== 0) {
          addOutputEntry(`[Process exited with code ${message.code}]`, "error");
        }
        break;

      case "error":
        setIsExecuting(false);
        if (message.message) {
          addOutputEntry(`Error: ${message.message}`, "error");
        }
        break;

      default:
        console.warn("Unknown message type:", message.type);
    }
  };

  /**
   * Add an output entry
   */
  const addOutputEntry = (text: string, type: TerminalOutputEntry["type"]) => {
    setOutputEntries((prev) => [...prev, { text, type }]);
  };

  /**
   * Clear output
   */
  const clearOutput = useCallback(() => {
    setOutputEntries([]);
  }, []);

  /**
   * Connect on mount, disconnect on unmount
   */
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    isExecuting,
    outputEntries,
    executeCommand,
    cancelCommand,
    clearOutput,
    reconnect: connect,
  };
}
