import { serve } from "@hono/node-server";
import fs from "fs";
import { Hono } from "hono";
import path from "path";
import { WebSocketServer } from "ws";
import { createClaudeSession } from "./claude-handler";
import { ignore } from "./ignore";
import { createTerminalSession } from "./terminal-handler";

const app = new Hono();

const ROOT = process.cwd();

function walk(dir: string) {
  const result: any[] = [];
  for (const name of fs.readdirSync(dir)) {
    // Skip directories in the ignore list
    if (ignore.includes(name)) {
      continue;
    }

    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    result.push({
      name,
      type: stat.isDirectory() ? "dir" : "file",
      path: path.relative(ROOT, full),
      ...(stat.isDirectory() ? { children: walk(full) } : {}),
    });
  }
  return result;
}

// GET /health → health check
app.get("/health", (c) => {
  return c.text("OK", 200);
});

// GET /tree → return nested file tree
app.get("/tree", (c) => {
  const tree = walk(ROOT);
  return c.json({
    root: path.basename(ROOT),
    tree,
  });
});

// GET /file/:path → return file contents
app.get("/file/:path{.+}", (c) => {
  const relPath = c.req.param("path");

  if (!relPath) {
    return c.text("Not found", 404);
  }

  const fullPath = path.join(ROOT, relPath);

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    return c.text("Not found", 404);
  }
  const contents = fs.readFileSync(fullPath, "utf-8");
  return c.json({ path: relPath, contents });
});

// POST /terminal/execute → execute terminal command
app.post("/terminal/execute", async (c) => {
  const { command } = await c.req.json();

  // Dummy response based on command
  let output = "";
  if (command === "pwd") {
    output = ROOT;
  } else if (command === "ls") {
    output = "index.ts\npackage.json\nignore.ts\ntest";
  } else if (command === "whoami") {
    output = "user";
  } else {
    output = `Command '${command}' executed successfully`;
  }

  return c.json({ output });
});

/*
 * Start the HTTP server and WebSocket server
 */
const server = serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`🚀 Agent running at http://localhost:${info.port}`);
  }
);

// Create WebSocket server for terminal connections
const wss = new WebSocketServer({
  server: server as any,
});

wss.on("connection", (ws, req) => {
  console.log("New WebSocket connection established");

  // Keep the connection alive with periodic pings
  const keepaliveInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  // Route to appropriate handler based on endpoint
  if (req.url === "/terminal/ws") {
    // Create a terminal session for this connection
    const session = createTerminalSession(ws, ROOT);

    ws.on("close", () => {
      console.log("Terminal WebSocket connection closed");
      clearInterval(keepaliveInterval);
      session.cleanup();
    });
  } else if (req.url === "/claude/ws") {
    // Create a Claude session for this connection
    const session = createClaudeSession(ws, ROOT);

    ws.on("close", (code, reason) => {
      console.log("Claude WebSocket connection closed", { code, reason: reason.toString() });
      clearInterval(keepaliveInterval);
      session.cleanup();
    });

    ws.on("error", (error) => {
      console.error("Claude WebSocket error:", error);
    });
  } else {
    clearInterval(keepaliveInterval);
    ws.close(1008, "Invalid endpoint");
  }
});
