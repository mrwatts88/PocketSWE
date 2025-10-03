import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHostUrl } from "./use-host-url";

const SESSION_ID_KEY = "claude_session_id";

export type ClaudeConnectionState = "connecting" | "connected" | "disconnected" | "error";

export interface ClaudeMessage {
  type: "start_session" | "send_prompt" | "output_chunk" | "error";
  sessionId?: string;
  prompt?: string;
  output?: any;
  message?: string;
}

export function useClaudeWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const keepaliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [connectionState, setConnectionState] = useState<ClaudeConnectionState>("disconnected");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [outputEvents, setOutputEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [isResumedSession, setIsResumedSession] = useState(false);
  const { url } = useHostUrl();

  /**
   * Load persisted sessionId from SecureStore on mount
   */
  useEffect(() => {
    const loadSession = async () => {
      try {
        const stored = await SecureStore.getItemAsync(SESSION_ID_KEY);
        if (stored) {
          sessionIdRef.current = stored;
          setSessionId(stored);
          setIsResumedSession(true); // Mark as resumed
        }
      } catch (error) {
        console.error("Failed to load sessionId:", error);
      } finally {
        setIsSessionLoaded(true);
      }
    };
    loadSession();
  }, []);

  /**
   * Persist sessionId to SecureStore when it changes
   */
  useEffect(() => {
    if (!isSessionLoaded) return;

    const saveSession = async () => {
      try {
        if (sessionId) {
          await SecureStore.setItemAsync(SESSION_ID_KEY, sessionId);
        } else {
          await SecureStore.deleteItemAsync(SESSION_ID_KEY);
        }
      } catch (error) {
        console.error("Failed to save sessionId:", error);
      }
    };
    saveSession();
  }, [sessionId, isSessionLoaded]);

  /**
   * Connect to daemon
   */
  const connect = useCallback(() => {
    setConnectionState("connecting");

    // 👇 Adjust this to your daemon URL
    const ws = new WebSocket(url + "/claude/ws");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket opened");
      setConnectionState("connected");

      // Start keepalive ping every 30 seconds

      // @ts-ignore
      keepaliveIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          // WebSocket ping is automatic, but we can send a dummy message
          // or just check the state to keep the connection alive
        }
      }, 30000);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed", { code: event.code, reason: event.reason });

      // Clear keepalive
      if (keepaliveIntervalRef.current) {
        clearInterval(keepaliveIntervalRef.current);
        keepaliveIntervalRef.current = null;
      }

      setConnectionState("disconnected");
      // Preserve sessionId and outputEvents on unexpected disconnect
      const wasUnexpected = event.code !== 1000;
      if (!wasUnexpected) {
        setSessionId(null);
        sessionIdRef.current = null;
      }
      setIsLoading(false);

      // Auto-reconnect after 1 second if it wasn't a manual close
      if (wasUnexpected) {
        console.log("Auto-reconnecting in 1s... (preserving session)");
        setTimeout(() => {
          console.log("Attempting reconnect...");
          connect();
        }, 1000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionState("error");
      setIsLoading(false);
    };

    ws.onmessage = (event) => {
      try {
        const msg: ClaudeMessage = JSON.parse(event.data);

        switch (msg.type) {
          case "output_chunk":
            if (msg.output) {
              setOutputEvents((prev) => [...prev, msg.output]);

              // Stop loading only when we get the final result
              // (assistant messages with tool_use means Claude is still working)
              if (msg.output.type === "result") {
                setIsLoading(false);
              }

              // Extract sessionId from the first output_chunk that has it
              if (msg.sessionId && !sessionIdRef.current) {
                sessionIdRef.current = msg.sessionId;
                setSessionId(msg.sessionId);
              }
            }
            break;

          case "error":
            console.error("Claude error:", msg.message);
            setIsLoading(false);
            break;
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };
  }, [url]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  /**
   * Start a new session
   */
  const startSession = useCallback(() => {
    setIsLoading(true);
    setIsResumedSession(false); // This is a fresh session
    wsRef.current?.send(JSON.stringify({ type: "start_session" }));
  }, []);

  /**
   * Send a prompt
   */
  const sendPrompt = useCallback(
    (prompt: string, sid?: string) => {
      const activeSession = sid || sessionId;
      if (!activeSession) {
        console.warn("No active session to send prompt");
        return;
      }
      setIsLoading(true);
      wsRef.current?.send(
        JSON.stringify({
          type: "send_prompt",
          prompt,
          sessionId: activeSession,
        })
      );
    },
    [sessionId]
  );

  /**
   * Clear current output
   */
  const clearOutput = useCallback(() => setOutputEvents([]), []);

  /**
   * Reset session (clear output and sessionId for fresh start)
   */
  const resetSession = useCallback(() => {
    setOutputEvents([]);
    setSessionId(null);
    sessionIdRef.current = null;
    setIsLoading(false);
    setIsResumedSession(false);
  }, []);

  /**
   * Add a local user message (for immediate UI feedback)
   */
  const addUserMessage = useCallback((text: string) => {
    const userMessage = {
      type: "user",
      message: {
        content: [{ type: "text", text }],
      },
      uuid: `user-${Date.now()}`,
    };
    setOutputEvents((prev) => [...prev, userMessage]);
  }, []);

  /**
   * Reconnect manually
   */
  const reconnect = useCallback(() => {
    wsRef.current?.close();
    connect();
  }, [connect]);

  return {
    connectionState,
    sessionId,
    outputEvents,
    isLoading,
    isResumedSession,
    startSession,
    sendPrompt,
    clearOutput,
    resetSession,
    addUserMessage,
    reconnect,
  };
}
