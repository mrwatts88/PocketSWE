import { spawn } from "child_process";
import type { WebSocket } from "ws";

export interface ClaudeMessage {
  type: "start_session" | "send_prompt" | "output_chunk" | "error";
  sessionId?: string; // always a string if present
  prompt?: string;
  output?: any; // JSON event from Claude
  message?: string;
}

/**
 * Handles WebSocket messages for Claude headless sessions.
 */
export class ClaudeSessionHandler {
  private ws: WebSocket;
  private workingDirectory: string;

  constructor(ws: WebSocket, workingDirectory: string) {
    this.ws = ws;
    this.workingDirectory = workingDirectory;
    this.setupMessageHandler();
  }

  cleanup() {
    // Close any subprocess or do other teardown
    // If you spawn Claude CLI with child_process, kill it here
  }

  /**
   * Set up WebSocket message handling
   */
  private setupMessageHandler() {
    this.ws.on("message", (data: Buffer) => {
      try {
        const message: ClaudeMessage = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error("[ClaudeHandler] Parse error:", error);
        this.sendError(`Failed to parse WS message: ${error}`);
      }
    });

    this.ws.on("close", () => {
      console.log("[ClaudeHandler] WS closed");
    });

    this.ws.on("error", (error) => {
      console.error("[ClaudeHandler] WS error:", error);
    });
  }

  /**
   * Handle messages from the client
   */
  private async handleMessage(message: ClaudeMessage) {
    switch (message.type) {
      case "start_session":
        console.log("[ClaudeHandler] Starting session...");
        this.startSession();
        break;

      case "send_prompt":
        if (message.sessionId && message.prompt) {
          this.sendPrompt(message.sessionId, message.prompt);
        } else {
          this.sendError("Missing sessionId or prompt for send_prompt");
        }
        break;

      default:
        console.error("[ClaudeHandler] Unknown message type:", message.type);
        this.sendError(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Start a new Claude session and return its sessionId
   */
  private startSession() {
    console.log("[startSession] Spawning Claude process...");
    const args = [
      "-p",
      "You are now connected to a new session.", // lightweight init prompt
      "--allowedTools",
      "Read,Write,Edit,Execute",
      "--output-format",
      "stream-json",
      "--verbose",
    ];

    const proc = spawn("claude", args, {
      cwd: this.workingDirectory,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let sessionId: string | null = null;
    let buffer = "";

    proc.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);

          // Detect and capture the sessionId when it first appears
          if (event?.session_id && !sessionId) {
            sessionId = event.session_id as string;
            if (typeof sessionId !== "string" || sessionId.length === 0) {
              this.sendError("Invalid sessionId returned from Claude");
              continue;
            }
          }

          // Forward all events with sessionId included
          this.sendMessage({
            type: "output_chunk",
            output: event,
            ...(sessionId ? { sessionId } : {}),
          });
        } catch (err) {
          console.error("Failed to parse Claude JSON:", line, err);
        }
      }
    });

    proc.stderr.on("data", (d) => {
      console.error("Claude stderr:", d.toString());
    });

    proc.on("exit", (code) => {
      // Flush any remaining buffer before exiting
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer);
          this.sendMessage({
            type: "output_chunk",
            output: event,
            ...(sessionId ? { sessionId } : {}),
          });
        } catch (err) {
          console.error("Failed to parse final buffer:", buffer, err);
        }
      }

      if (code !== 0) {
        console.error("Claude exited with code", code);
        this.sendError(`Claude exited with code ${code}`);
      }
    });
  }

  /**
   * Send a prompt into an existing session
   */
  private sendPrompt(sessionId: string, prompt: string) {
    const args = ["-p", prompt, "--allowedTools", "Read,Write,Edit,Execute", "--resume", sessionId, "--output-format", "stream-json", "--verbose"];

    const proc = spawn("claude", args, {
      cwd: this.workingDirectory,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let buffer = "";

    proc.stdout.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          this.sendMessage({
            type: "output_chunk",
            output: event,
            sessionId,
          });
        } catch (err) {
          console.error("Failed to parse Claude JSON:", line, err);
        }
      }
    });

    proc.stderr.on("data", (d) => {
      console.error("Claude stderr:", d.toString());
    });

    proc.on("exit", (code) => {
      // Flush any remaining buffer before exiting
      if (buffer.trim()) {
        try {
          const event = JSON.parse(buffer);
          this.sendMessage({
            type: "output_chunk",
            output: event,
            sessionId,
          });
        } catch (err) {
          console.error("Failed to parse final buffer:", buffer, err);
        }
      }

      if (code !== 0) {
        console.error("[sendPrompt] Non-zero exit code");
        this.sendError(`Claude exited with code ${code}`);
      }

      console.log("[sendPrompt] Process fully completed");
    });
  }

  /**
   * Send error to client
   */
  private sendError(message: string) {
    this.sendMessage({ type: "error", message });
  }

  /**
   * Send JSON to the client
   */
  private sendMessage(message: ClaudeMessage) {
    if (this.ws.readyState === 1) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

/**
 * Factory
 */
export function createClaudeSession(ws: WebSocket, workingDirectory: string): ClaudeSessionHandler {
  return new ClaudeSessionHandler(ws, workingDirectory);
}
