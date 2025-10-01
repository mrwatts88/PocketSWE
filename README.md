# PocketSWE

A mobile-first code editor and file browser built with React Native and Expo. PocketSWE provides a clean, intuitive interface for viewing and exploring code on mobile devices with syntax highlighting, line selection, and dynamic daemon configuration.

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

### 🎨 Theme Support

- **Automatic light and dark mode** support
- **Theme-aware syntax highlighting** colors
- **Adaptive UI elements** that respond to system theme
- **VS Code-inspired color schemes**:
  - Light mode: Traditional VS Code Light+ colors
  - Dark mode: VS Code Dark+ colors
- **Line selection highlighting** with theme-appropriate colors

### ⚙️ Dynamic Configuration

- **Settings tab** for daemon URL configuration
- **Connection testing** with real-time feedback
- **Secure storage** of URLs using Expo SecureStore
- **Automatic cache refresh** when connection succeeds
- **Contextual error handling** with direct settings navigation
- **Input validation** and connection status indicators

### 📱 Mobile Optimized

- **Safe area handling** to avoid status bar overlap
- **Responsive layouts** that adapt to screen size
- **Font scaling support** for accessibility
- **Smooth scrolling** with proper touch targets
- **Professional error screens** with actionable guidance
- **Optimized for iPhone and Android** devices

## Tech Stack

- **Framework**: [Expo](https://expo.dev) + React Native
- **Routing**: Expo Router (file-based routing)
- **Data Fetching**: SWR (stale-while-revalidate)
- **Storage**: Expo SecureStore for URL persistence
- **Styling**: React Native StyleSheet with theme system
- **Icons**: Expo Vector Icons (@expo/vector-icons)
- **Type Safety**: TypeScript

## Project Structure

```
PocketSWE/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx      # Files tab (file explorer)
│   │   ├── explore.tsx    # Editor tab (code viewer)
│   │   └── settings.tsx   # Settings tab (daemon config)
│   └── _layout.tsx
├── components/            # Reusable UI components
│   ├── file-explorer.tsx  # File tree component
│   ├── host-url-provider.tsx # URL context provider
│   ├── themed-text.tsx    # Theme-aware text
│   └── themed-view.tsx    # Theme-aware view
├── constants/
│   └── theme.ts          # Theme colors and tokens
├── hooks/                # Custom React hooks
│   ├── use-color-scheme.ts
│   ├── use-host-url.ts    # URL management hook
│   └── use-theme-color.ts
├── services/             # API and data services
│   ├── fetcher.ts        # SWR fetcher function
│   └── editor/
│       ├── use-file-tree.ts      # File tree hook
│       └── use-file-contents.ts  # File contents hook
└── utils/                # Utility functions
    ├── file-tree.ts      # File tree types and helpers
    └── syntax-highlighter.tsx  # Syntax highlighting component
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo Go app (for testing on physical devices)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Open the app:
   - Scan the QR code with Expo Go (Android/iOS)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web

### Backend Setup

PocketSWE requires a backend server (daemon) to provide file tree and file contents data:

- **File Tree Endpoint**: `GET /tree`
  - Returns an array of `TreeItem` objects with file/directory structure
- **File Contents Endpoint**: `GET /file/:filePath`
  - Returns file contents with path information
- **Health Check Endpoint**: `GET /health`
  - Returns 200 status for connection testing

Example response format:

```json
// File tree
[
  {
    "name": "src",
    "type": "dir",
    "path": "src",
    "children": [...]
  }
]

// File contents
{
  "path": "src/index.ts",
  "contents": "export const hello = 'world';"
}
```

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
- **Dynamic daemon configuration** with connection testing
- **Comprehensive error handling** with contextual navigation
- **Full theme support** (light/dark mode)
- **Secure URL storage** and automatic cache management

### 🚧 Next Steps

The ultimate vision is a **voice-controlled mobile coding environment**:

1. **File Editing** - Transition from read-only to editable code viewer
2. **Terminal Integration** - Add terminal tab for command execution
3. **AI Integration** - Connect to Claude Code for intelligent assistance
4. **Voice Interface** - Speech-to-text for hands-free coding commands

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
