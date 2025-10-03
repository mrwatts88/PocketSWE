import { ChildProcess, spawn } from "child_process";
import type { WebSocket } from "ws";
import { isCommandAllowed } from "./command-allowlist";

/**
 * Message types for WebSocket communication
 */
export interface TerminalMessage {
  type: "execute" | "cancel" | "stdout" | "stderr" | "exit" | "error";
  command?: string;
  data?: string;
  code?: number;
  message?: string;
}

/**
 * Terminal session manager
 * Handles command execution, process lifecycle, and WebSocket communication
 */
export class TerminalSession {
  private ws: WebSocket;
  private currentProcess: ChildProcess | null = null;
  private processTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly workingDirectory: string;
  private readonly maxExecutionTime = 60000; // 60 seconds

  constructor(ws: WebSocket, workingDirectory: string) {
    this.ws = ws;
    this.workingDirectory = workingDirectory;
    this.setupMessageHandler();
  }

  /**
   * Set up WebSocket message handler
   */
  private setupMessageHandler() {
    this.ws.on("message", (data: Buffer) => {
      try {
        const message: TerminalMessage = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        this.sendError(`Failed to parse message: ${error}`);
      }
    });

    this.ws.on("close", () => {
      this.cleanup();
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.cleanup();
    });
  }

  /**
   * Handle incoming messages from client
   */
  private handleMessage(message: TerminalMessage) {
    switch (message.type) {
      case "execute":
        if (message.command) {
          this.executeCommand(message.command);
        } else {
          this.sendError("No command provided");
        }
        break;

      case "cancel":
        this.cancelCommand();
        break;

      default:
        this.sendError(`Unknown message type: ${message.type}`);
    }
  }

  /**
   * Execute a command
   */
  private executeCommand(commandStr: string) {
    // Check if there's already a process running
    if (this.currentProcess) {
      this.sendError("A command is already running. Cancel it first.");
      return;
    }

    // Validate command against allowlist
    const validation = isCommandAllowed(commandStr);
    if (!validation.allowed) {
      this.sendError(validation.reason || "Command not allowed");
      return;
    }

    // Parse command and arguments
    const parsedCommand = this.parseCommandString(commandStr);
    const [command, ...args] = parsedCommand;

    // Validate that we have a command
    if (!command) {
      this.sendError("Invalid command");
      return;
    }

    try {
      // Spawn the process
      this.currentProcess = spawn(command, args, {
        cwd: this.workingDirectory,
        shell: false, // Don't use shell for security
        env: {
          ...process.env,
          // Limit environment variables for security
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          USER: process.env.USER,
        },
      });

      // Set up timeout
      this.processTimeout = setTimeout(() => {
        if (this.currentProcess) {
          this.currentProcess.kill("SIGTERM");
          this.sendError("Command timed out after 60 seconds");
        }
      }, this.maxExecutionTime);

      // Handle stdout
      this.currentProcess.stdout?.on("data", (data: Buffer) => {
        this.sendStdout(data.toString());
      });

      // Handle stderr
      this.currentProcess.stderr?.on("data", (data: Buffer) => {
        this.sendStderr(data.toString());
      });

      // Store reference to process for event handlers
      const childProcess = this.currentProcess;

      // Handle process exit
      childProcess.on("exit", (code, signal) => {
        this.clearProcessTimeout();
        const exitCode = code !== null ? code : signal ? 128 : 1;
        this.sendExit(exitCode);
        this.currentProcess = null;
      });

      // Handle process error
      childProcess.on("error", (error) => {
        this.clearProcessTimeout();
        this.sendError(`Failed to execute command: ${error.message}`);
        this.currentProcess = null;
      });
    } catch (error) {
      this.sendError(`Failed to spawn process: ${error}`);
    }
  }

  /**
   * Cancel the currently running command
   */
  private cancelCommand() {
    if (!this.currentProcess) {
      this.sendError("No command is currently running");
      return;
    }

    try {
      // Try graceful termination first
      this.currentProcess.kill("SIGTERM");

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.currentProcess) {
          this.currentProcess.kill("SIGKILL");
        }
      }, 5000);

      this.sendStderr("\n[Command cancelled by user]\n");
    } catch (error) {
      this.sendError(`Failed to cancel command: ${error}`);
    }
  }

  /**
   * Parse command string into command and arguments
   * Handles quoted strings properly
   */
  private parseCommandString(commandStr: string): string[] {
    const args: string[] = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < commandStr.length; i++) {
      const char = commandStr[i];

      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = "";
      } else if (char === " " && !inQuotes) {
        if (current) {
          args.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }

    if (current) {
      args.push(current);
    }

    return args;
  }

  /**
   * Clear process timeout
   */
  private clearProcessTimeout() {
    if (this.processTimeout) {
      clearTimeout(this.processTimeout);
      this.processTimeout = null;
    }
  }

  /**
   * Send stdout data to client
   */
  private sendStdout(data: string) {
    this.sendMessage({ type: "stdout", data });
  }

  /**
   * Send stderr data to client
   */
  private sendStderr(data: string) {
    this.sendMessage({ type: "stderr", data });
  }

  /**
   * Send exit code to client
   */
  private sendExit(code: number) {
    this.sendMessage({ type: "exit", code });
  }

  /**
   * Send error message to client
   */
  private sendError(message: string) {
    this.sendMessage({ type: "error", message });
  }

  /**
   * Send a message to the client
   */
  private sendMessage(message: TerminalMessage) {
    if (this.ws.readyState === 1) {
      // WebSocket.OPEN
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.currentProcess) {
      try {
        this.currentProcess.kill("SIGTERM");
      } catch (error) {
        console.error("Error killing process:", error);
      }
      this.currentProcess = null;
    }

    this.clearProcessTimeout();
  }
}

/**
 * Create a new terminal session for a WebSocket connection
 */
export function createTerminalSession(ws: WebSocket, workingDirectory: string): TerminalSession {
  return new TerminalSession(ws, workingDirectory);
}
