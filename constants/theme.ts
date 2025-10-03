/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    danger: "#dc2626",
    codeLineEven: "rgba(0, 0, 0, 0.02)",
    codeLineOdd: "rgba(0, 0, 0, 0.08)",
    codeBackground: "rgba(0, 0, 0, 0.08)",
    selectedLine: "rgba(10, 126, 164, 0.15)",
    // Terminal colors for light mode
    terminalBackground: "#F5F2ED", // More noticeable cream/beige
    terminalCommand: "#0066CC",
    terminalOutput: "#333333",
    terminalError: "#DC143C",
    terminalPrompt: "#228B22",
    terminalPlaceholder: "#999999",
    terminalBorder: "#D4C4B0", // Light brown border for cream background
    // AI chat colors
    aiBackground: "rgba(0, 0, 0, 0.08)",
    aiAssistant: "#11181C",
    aiUser: "#0a7ea4",
    aiTool: "#D97706",
    aiError: "#DC2626",
    aiSystem: "#6B7280",
    aiSuccess: "#059669",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    danger: "#ef4444",
    codeLineEven: "rgba(0, 0, 0, 0.04)",
    codeLineOdd: "rgba(0, 0, 0, 0.2)",
    codeBackground: "rgba(0, 0, 0, 0.2)",
    selectedLine: "rgba(255, 255, 255, 0.1)",
    // Terminal colors for dark mode
    terminalBackground: "#0D1117",
    terminalCommand: "#4CAF50",
    terminalOutput: "#58A6FF",
    terminalError: "#FF6B6B",
    terminalPrompt: "#4CAF50",
    terminalPlaceholder: "#666666",
    terminalBorder: "#333333",
    // AI chat colors
    aiBackground: "rgba(0, 0, 0, 0.2)",
    aiAssistant: "#ECEDEE",
    aiUser: "#58A6FF",
    aiTool: "#F59E0B",
    aiError: "#FF6B6B",
    aiSystem: "#9BA1A6",
    aiSuccess: "#10B981",
  },
};

export const FileTypeColors = {
  // JavaScript/TypeScript
  js: "#F7DF1E",
  jsx: "#F7DF1E",
  ts: "#3178C6",
  tsx: "#3178C6",

  // Data formats
  json: "#FF6B35",
  md: "#083FA1",

  // Images
  png: "#FF69B4",
  jpg: "#FF69B4",
  jpeg: "#FF69B4",
  gif: "#FF69B4",

  // Web
  css: "#1572B6",
  html: "#E34F26",

  // Programming languages
  py: "#3776AB",
  java: "#ED8B00",
  go: "#00ADD8",
  rs: "#DEA584",

  // Default
  default: "#6B7280",
  folder: "#FFD700",
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
