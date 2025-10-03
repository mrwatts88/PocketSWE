# PocketSWE

A mobile-first code editor and integrated terminal built with React Native and Expo. PocketSWE provides a powerful, intuitive interface for exploring code and executing commands on mobile devices with real-time WebSocket streaming, intelligent command history, and professional syntax highlighting.

## Features

### 📁 File Explorer

- **Collapsible file tree** with expand/collapse folder functionality
- **Color-coded file type icons** for different file extensions
- **Progressive indentation** with horizontal scrolling for deep nesting
- **Full-width tap targets** optimized for mobile interaction
- **Alternating row backgrounds** for better readability
- **Real-time data fetching** with SWR for automatic updates
- **Connection error handling** with direct navigation to settings

### 📝 Code Editor

- **Interactive line selection** - tap any line to highlight it
- **Read-only code viewer** with professional syntax highlighting
- **Dynamic line numbers** with automatic width calculation
- **Horizontal scrolling** for long lines of code
- **VS Code-inspired syntax highlighting** for:
  - JavaScript/TypeScript (keywords, functions, types)
  - Strings, numbers, and literals
  - Comments (inline and full-line)
  - Boolean and nullish values
- **Smart comment detection** (avoids false positives in URLs)
- **File navigation** with contextual error handling

### 💻 Integrated Terminal

- **Real-time WebSocket streaming** for command execution
- **Live output display** with stdout/stderr separation
- **Blinking terminal cursor** with current input preview
- **Command history** with smart autocomplete:
  - Persisted across sessions in SecureStore
  - Excludes common commands from history
  - Global deduplication (keeps most recent)
  - Quick access chips for recent commands
- **Common command suggestions** (pwd, ls, git status, npm, etc.)
- **Filtered autocomplete** as you type
- **Command cancellation** with graceful/force termination
- **Security features**:
  - Server-side command allowlist
  - Argument validation for sensitive commands
  - 60-second timeout protection
  - No shell execution (uses spawn directly)
- **Mobile-optimized UX**:
  - Keyboard persistence across commands
  - iOS autocomplete disabled
  - Tap chips to fill commands
  - Delete history items with X button
  - Auto-scroll to bottom on output

### 🎨 Theme Support

- **Manual theme control** with three modes:
  - ☀️ Light mode (always light)
  - 🌙 Dark mode (always dark)
  - 📱 System mode (follows iOS settings)
- **Instant theme switching** across entire app
- **Theme-aware syntax highlighting** colors
- **Adaptive UI elements** that respond to theme changes
- **VS Code-inspired color schemes**:
  - Light mode: Traditional VS Code Light+ colors
  - Dark mode: VS Code Dark+ colors
- **Line selection highlighting** with theme-appropriate colors
- **Persisted preference** in SecureStore

### ⚙️ Dynamic Configuration

- **Settings tab** with comprehensive options:
  - Daemon URL configuration with connection testing
  - Tab mode switcher (Classic vs Drag Preview)
  - Theme selector (Light/Dark/System)
  - Clear instructions and help text
- **Connection testing** with real-time status feedback
- **Secure storage** using Expo SecureStore for:
  - Daemon URL
  - Theme preference
  - Terminal command history
  - Tab mode preference
- **Automatic cache refresh** when connection succeeds
- **Input validation** and connection status indicators
- **No persistence** for open files or file tree state (fresh start each launch)

### 📱 Mobile Optimized

- **Safe area handling** to avoid status bar overlap
- **Responsive layouts** that adapt to screen size
- **Font scaling support** for accessibility
- **Smooth scrolling** with proper touch targets
- **Professional error screens** with actionable guidance
- **Optimized for iPhone and Android** devices

## Tech Stack

### Frontend (Mobile App)
- **Framework**: [Expo](https://expo.dev) + React Native
- **Routing**: Expo Router (file-based routing)
- **Data Fetching**: SWR (stale-while-revalidate)
- **Real-time Communication**: Native WebSocket API
- **Storage**: Expo SecureStore for persistence
- **Styling**: React Native StyleSheet with theme system
- **Icons**: Expo Vector Icons (@expo/vector-icons)
- **Type Safety**: TypeScript

### Backend (Server)
- **Framework**: [Hono](https://hono.dev) (fast web framework)
- **Runtime**: Node.js 20+
- **WebSocket**: [ws](https://github.com/websockets/ws) library
- **Process Management**: Node.js child_process.spawn
- **Type Safety**: TypeScript

## Project Structure

```
PocketSWE/
├── app/                           # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx             # Files tab (file explorer)
│   │   ├── explore.tsx           # Editor tab (code viewer)
│   │   ├── terminal.tsx          # Terminal tab (command execution)
│   │   └── settings.tsx          # Settings tab (configuration)
│   └── _layout.tsx               # Root layout with providers
├── components/                   # Reusable UI components
│   ├── file-explorer.tsx         # File tree component
│   ├── host-url-provider.tsx    # URL context provider
│   ├── theme-provider.tsx        # Theme context provider
│   ├── open-files-provider.tsx  # Open files context
│   ├── tab-mode-provider.tsx    # Tab mode context
│   ├── themed-text.tsx           # Theme-aware text
│   └── themed-view.tsx           # Theme-aware view
├── constants/
│   └── theme.ts                  # Theme colors and tokens
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts       # Active color scheme hook
│   ├── use-host-url.ts           # URL management
│   ├── use-theme.ts              # Theme management (internal)
│   ├── use-theme-color.ts        # Theme color accessor
│   ├── use-command-history.ts    # Terminal command history
│   ├── use-terminal-websocket.ts # WebSocket terminal connection
│   ├── use-open-files.ts         # Open files management
│   └── use-tab-mode.ts           # Tab mode preference
├── server/                       # Backend server (Node.js/Hono)
│   ├── index.ts                  # Server entry + WebSocket endpoint
│   ├── command-allowlist.ts      # Security: allowed commands
│   ├── terminal-handler.ts       # WebSocket terminal session manager
│   ├── ignore.ts                 # Files to exclude from tree
│   ├── package.json              # Server dependencies
│   └── tsconfig.json             # Server TypeScript config
├── services/                     # API and data services
│   ├── fetcher.ts                # SWR fetcher function
│   └── editor/
│       ├── use-file-tree.ts      # File tree data hook
│       └── use-file-contents.ts  # File contents hook
└── utils/                        # Utility functions
    ├── file-tree.ts              # File tree types and helpers
    └── syntax-highlighter.tsx    # Syntax highlighting component
```

## Getting Started

### Prerequisites

- Node.js (v20 or higher) - see `.nvmrc` file
- npm (comes with Node.js)
- Expo Go app (for testing on physical devices)

### Installation

1. **Use the correct Node.js version:**

   ```bash
   # If you have nvm installed
   nvm use

   # This will switch to Node.js 20 as specified in .nvmrc
   ```

2. **Install dependencies for the entire monorepo:**

   ```bash
   npm install
   ```

3. **Start development servers:**

   **Option A: Run both mobile app and server together:**

   ```bash
   npm run dev
   ```

   **Option B: Run individually:**

   ```bash
   # Mobile app only
   npm start

   # Server only (in another terminal)
   npm run server:dev
   ```

4. **Open the mobile app:**
   - Scan the QR code with Expo Go (Android/iOS)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web

## Monorepo Structure

This project uses npm workspaces to manage both the mobile app and server in a single repository:

```
PocketSWE/
├── app/                    # Mobile app (Expo/React Native)
├── components/             # Mobile app components
├── server/                 # Backend server (Hono/Node.js)
│   ├── index.ts           # Server entry point
│   ├── package.json       # Server dependencies
│   └── tsconfig.json      # Server TypeScript config
├── package.json           # Root package.json with workspaces
├── .nvmrc                 # Node.js version specification
└── ...
```

### Available Scripts

**Root level commands:**

- `npm run dev` - Run both mobile app and server concurrently
- `npm run start` - Start mobile app only
- `npm run server:dev` - Start server in development mode
- `npm run server:start` - Start server in production mode
- `npm install` - Install dependencies for all workspaces

**Workspace-specific commands:**

- `npm run start --workspace=server` - Run server commands from root
- `npm install some-package --workspace=server` - Install packages to server workspace

### Development Workflow

1. **Initial setup:**

   ```bash
   nvm use          # Switch to Node.js 20
   npm install      # Install all dependencies
   ```

2. **Daily development:**

   ```bash
   npm run dev      # Starts both mobile app and server
   ```

3. **Server-only development:**
   ```bash
   npm run server:dev
   ```

The server runs on `http://localhost:3000` by default and provides the API endpoints that the mobile app connects to.

### Backend API

The included server provides the following endpoints:

#### HTTP Endpoints

- **`GET /health`** - Health check
  - Returns 200 OK status for connection testing

- **`GET /tree`** - File tree structure
  - Returns nested tree of files and directories
  - Example response:
    ```json
    {
      "root": "PocketSWE",
      "tree": [
        {
          "name": "src",
          "type": "dir",
          "path": "src",
          "children": [...]
        }
      ]
    }
    ```

- **`GET /file/:path`** - File contents
  - Returns file contents for the specified path
  - Example response:
    ```json
    {
      "path": "src/index.ts",
      "contents": "export const hello = 'world';"
    }
    ```

#### WebSocket Endpoints

- **`WS /terminal/ws`** - Terminal WebSocket connection
  - Real-time bidirectional command execution
  - Client → Server messages:
    ```json
    { "type": "execute", "command": "ls -la" }
    { "type": "cancel" }
    ```
  - Server → Client messages:
    ```json
    { "type": "stdout", "data": "file.txt\n" }
    { "type": "stderr", "data": "error message\n" }
    { "type": "exit", "code": 0 }
    { "type": "error", "message": "Command not allowed" }
    ```

#### Security Features

The server includes robust security measures for terminal execution:
- **Command allowlist**: Only safe commands permitted (pwd, ls, git, npm, etc.)
- **Argument validation**: Restricted arguments for sensitive commands
- **Blocked commands**: rm, sudo, chmod, network commands, etc.
- **Process isolation**: No shell execution, uses spawn directly
- **Timeout protection**: 60-second max execution time
- **Graceful termination**: SIGTERM followed by SIGKILL if needed

## Theme Customization

Customize colors in `constants/theme.ts`:

```typescript
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    codeLineEven: "rgba(0, 0, 0, 0.02)",
    codeLineOdd: "rgba(0, 0, 0, 0.08)",
    // ... more colors
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    codeLineEven: "rgba(0, 0, 0, 0.04)",
    codeLineOdd: "rgba(0, 0, 0, 0.2)",
    // ... more colors
  },
};
```

## Architecture Highlights

### Data Fetching

- **SWR integration** for automatic caching, revalidation, and error handling
- **Dynamic URL configuration** via React Context and secure storage
- **Automatic cache refresh** when daemon connection changes
- **Centralized fetcher** function in `services/fetcher.ts`
- **Custom hooks** for file tree and file contents with real-time updates

### Theming

- **`useThemeColor` hook** provides consistent theming across components
- **Themed components** (`ThemedText`, `ThemedView`) automatically adapt
- **Syntax highlighter** uses `useColorScheme` for theme-aware colors
- **Line selection highlighting** with appropriate theme colors

### State Management

- **React Context** for global URL configuration (`useHostUrl`)
- **Local state** for UI interactions (line selection, folder expansion)
- **SWR cache** for automatic data synchronization
- **Secure persistence** with Expo SecureStore

### Code Organization

- **Separation of concerns**: components, services, hooks, and utils
- **TypeScript interfaces** for complete type safety
- **Modular components** for maximum reusability
- **Consistent error handling** across all connection states

## Current Status & Roadmap

### ✅ Completed Features

- **Mobile-optimized file browser** with collapsible folder tree
- **Professional code viewer** with line selection and syntax highlighting
- **Real-time terminal** with WebSocket streaming and command execution
- **Intelligent command history** with autocomplete and quick access chips
- **Manual theme control** with instant switching across entire app
- **Dynamic daemon configuration** with connection testing
- **Comprehensive error handling** with contextual navigation
- **Secure storage** for preferences and command history
- **Command security** with server-side allowlist and validation

### 🚧 Next Steps

The ultimate vision is a **voice-controlled mobile coding environment**:

1. **File Editing** - Transition from read-only to editable code viewer
2. **AI Integration** - Connect to Claude Code for intelligent assistance
3. **Voice Interface** - Speech-to-text for hands-free coding commands

### 🎯 Ultimate Vision

**"Hey Claude, refactor this function to use async/await"** → Claude Code analyzes the current file, makes the changes on your remote server, and shows the updated code in the mobile app. All controlled by voice while you're away from your desk.

The current foundation provides the infrastructure for this vision with secure daemon connections, real-time data sync, and professional mobile UX.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Syntax highlighting colors inspired by VS Code
- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
