/**
 * Command allowlist for terminal execution
 * Only commands in this list (and their allowed arguments) can be executed
 */

interface AllowedCommand {
  command: string;
  description: string;
  // If specified, only these argument patterns are allowed
  allowedArgs?: RegExp[];
  // If true, allows any arguments (use cautiously)
  allowAnyArgs?: boolean;
}

export const ALLOWED_COMMANDS: AllowedCommand[] = [
  // File system navigation and inspection
  { command: "ls", allowAnyArgs: true, description: "List directory contents" },
  { command: "pwd", allowAnyArgs: false, description: "Print working directory" },
  { command: "cat", allowAnyArgs: true, description: "Display file contents" },
  { command: "head", allowAnyArgs: true, description: "Display first lines of file" },
  { command: "tail", allowAnyArgs: true, description: "Display last lines of file" },
  { command: "find", allowAnyArgs: true, description: "Find files" },
  { command: "tree", allowAnyArgs: true, description: "Display directory tree" },

  // Text processing
  { command: "grep", allowAnyArgs: true, description: "Search text patterns" },
  { command: "wc", allowAnyArgs: true, description: "Count words, lines, bytes" },
  { command: "sort", allowAnyArgs: true, description: "Sort lines of text" },
  { command: "uniq", allowAnyArgs: true, description: "Report or omit repeated lines" },

  // System info
  { command: "whoami", allowAnyArgs: false, description: "Print current user" },
  { command: "date", allowAnyArgs: true, description: "Display or set date" },
  { command: "uptime", allowAnyArgs: false, description: "Show system uptime" },
  { command: "uname", allowAnyArgs: true, description: "Print system information" },
  { command: "hostname", allowAnyArgs: false, description: "Show system hostname" },

  // Git commands
  {
    command: "git",
    allowedArgs: [
      /^status$/,
      /^log(\s+.*)?$/,
      /^diff(\s+.*)?$/,
      /^branch(\s+.*)?$/,
      /^show(\s+.*)?$/,
      /^blame(\s+.*)?$/,
      /^rev-parse(\s+.*)?$/,
      /^ls-files(\s+.*)?$/,
      /^remote(\s+-v)?$/,
      /^config(\s+--list)?$/,
    ],
    description: "Version control (safe commands only)",
  },

  // Node.js / npm
  { command: "node", allowedArgs: [/^--version$/, /^-v$/], description: "Node.js (version only)" },
  {
    command: "npm",
    allowedArgs: [
      /^--version$/,
      /^-v$/,
      /^list(\s+.*)?$/,
      /^ls(\s+.*)?$/,
      /^view(\s+.*)?$/,
      /^show(\s+.*)?$/,
      /^outdated$/,
      /^run\s+\w+$/, // npm run [script-name]
      /^test$/,
      /^install(\s+.*)?$/,
      /^i(\s+.*)?$/, // npm i or npm i [package]
    ],
    description: "Node package manager (safe commands only)",
  },
  { command: "npx", allowAnyArgs: true, description: "Execute npm package binaries" },

  // Development tools
  { command: "echo", allowAnyArgs: true, description: "Display text" },
  { command: "which", allowAnyArgs: true, description: "Locate command" },
  { command: "env", allowAnyArgs: false, description: "Show environment variables" },
  { command: "printenv", allowAnyArgs: true, description: "Print environment variables" },
];

// Commands that are explicitly blocked (for documentation/safety)
const BLOCKED_COMMANDS = [
  "rm",
  "rmdir",
  "dd",
  "mkfs",
  "fdisk",
  "sudo",
  "su",
  "chmod",
  "chown",
  "chgrp",
  "kill",
  "killall",
  "pkill",
  "shutdown",
  "reboot",
  "halt",
  "poweroff",
  "passwd",
  "useradd",
  "userdel",
  "usermod",
  "iptables",
  "ufw",
  "firewall-cmd",
  "curl",
  "wget",
  "nc",
  "netcat",
  "telnet",
  "ssh",
  "scp",
  "sftp",
  "rsync",
  "mount",
  "umount",
  "systemctl",
  "service",
];

/**
 * Parse command string into command name and arguments
 */
function parseCommand(commandStr: string): { command: string; args: string } {
  const trimmed = commandStr.trim();
  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { command: trimmed, args: "" };
  }

  return {
    command: trimmed.substring(0, spaceIndex),
    args: trimmed.substring(spaceIndex + 1).trim(),
  };
}

/**
 * Check if a command is allowed to be executed
 * @returns { allowed: boolean, reason?: string }
 */
export function isCommandAllowed(commandStr: string): { allowed: boolean; reason?: string } {
  const { command, args } = parseCommand(commandStr);

  // Check if explicitly blocked
  if (BLOCKED_COMMANDS.includes(command)) {
    return { allowed: false, reason: `Command '${command}' is blocked for security reasons` };
  }

  // Find in allowlist
  const allowedCmd = ALLOWED_COMMANDS.find((cmd) => cmd.command === command);

  if (!allowedCmd) {
    return { allowed: false, reason: `Command '${command}' is not in the allowlist` };
  }

  // If no args provided and command doesn't require arg validation
  if (!args) {
    return { allowed: true };
  }

  // If command allows any args
  if (allowedCmd.allowAnyArgs) {
    return { allowed: true };
  }

  // If command has no args allowed
  if (!allowedCmd.allowedArgs || allowedCmd.allowedArgs.length === 0) {
    return { allowed: false, reason: `Command '${command}' does not accept arguments` };
  }

  // Check if args match any allowed pattern
  const argsAllowed = allowedCmd.allowedArgs.some((pattern) => pattern.test(args));

  if (!argsAllowed) {
    return { allowed: false, reason: `Arguments '${args}' are not allowed for command '${command}'` };
  }

  return { allowed: true };
}

/**
 * Get list of all allowed commands for display
 */
export function getAllowedCommandsList(): string[] {
  return ALLOWED_COMMANDS.map((cmd) => cmd.command);
}

/**
 * Get command descriptions for help text
 */
export function getCommandDescriptions(): Record<string, string> {
  return ALLOWED_COMMANDS.reduce((acc, cmd) => {
    acc[cmd.command] = cmd.description;
    return acc;
  }, {} as Record<string, string>);
}
