import { useCallback, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const HISTORY_KEY = "terminal_command_history";
const MAX_HISTORY_SIZE = 50;

/**
 * Common commands to show when no input or no history matches
 */
const COMMON_COMMANDS = [
  "pwd",
  "ls",
  "ls -la",
  "git status",
  "git log",
  "git diff",
  "npm run lint",
  "npm run test",
  "npm install",
  "whoami",
  "echo",
  "cat",
  "grep",
];

/**
 * Hook for managing terminal command history
 */
export function useCommandHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Load command history from SecureStore
   */
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const stored = await SecureStore.getItemAsync(HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(Array.isArray(parsed) ? parsed : []);
        }
      } catch (error) {
        console.error("Failed to load command history:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadHistory();
  }, []);

  /**
   * Save command history to SecureStore
   */
  const saveHistory = useCallback(async (newHistory: string[]) => {
    try {
      await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save command history:", error);
    }
  }, []);

  /**
   * Add a command to history
   * - Excludes common commands (they're always available)
   * - Removes duplicates globally (keeps most recent)
   */
  const addCommand = useCallback((command: string) => {
    if (!command.trim()) return;

    const trimmedCommand = command.trim();

    // Don't store common commands in history
    if (COMMON_COMMANDS.includes(trimmedCommand)) {
      return;
    }

    setHistory((prev) => {
      // Remove any existing occurrence of this command (global dedup)
      const filtered = prev.filter(cmd => cmd !== trimmedCommand);

      // Add to end and limit size
      const newHistory = [...filtered, trimmedCommand].slice(-MAX_HISTORY_SIZE);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  /**
   * Get filtered commands based on input prefix
   * Returns matching history commands or common commands if no matches
   * Excludes exact matches (no need to suggest what's already typed)
   */
  const getFilteredCommands = useCallback((prefix: string): string[] => {
    // If no prefix, return common commands
    if (!prefix.trim()) {
      return COMMON_COMMANDS;
    }

    const trimmedPrefix = prefix.trim();
    const lowerPrefix = trimmedPrefix.toLowerCase();

    // Filter history by prefix (case insensitive), excluding exact matches
    const matches = history
      .filter(cmd => {
        const lowerCmd = cmd.toLowerCase();
        return lowerCmd.startsWith(lowerPrefix) && lowerCmd !== lowerPrefix;
      })
      .reverse() // Show most recent first
      .slice(0, 10); // Limit to 10

    // If no matches, filter common commands (excluding exact match)
    if (matches.length === 0) {
      return COMMON_COMMANDS.filter(cmd => {
        const lowerCmd = cmd.toLowerCase();
        return lowerCmd.startsWith(lowerPrefix) && lowerCmd !== lowerPrefix;
      }).slice(0, 10);
    }

    return matches;
  }, [history]);

  /**
   * Get recent unique commands for quick access (last 5)
   */
  const getRecentCommands = useCallback((): string[] => {
    // Get last 10 commands and deduplicate
    const recent = [...history].reverse();
    const unique: string[] = [];

    for (const cmd of recent) {
      if (!unique.includes(cmd)) {
        unique.push(cmd);
      }
      if (unique.length >= 5) break;
    }

    return unique;
  }, [history]);

  /**
   * Remove a specific command from history
   */
  const removeCommand = useCallback((commandToRemove: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter(cmd => cmd !== commandToRemove);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  /**
   * Clear all command history
   */
  const clearHistory = useCallback(async () => {
    setHistory([]);
    try {
      await SecureStore.deleteItemAsync(HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear command history:", error);
    }
  }, []);

  return {
    history,
    isLoaded,
    addCommand,
    removeCommand,
    getFilteredCommands,
    getRecentCommands,
    clearHistory,
  };
}
