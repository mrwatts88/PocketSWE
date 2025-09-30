# PocketSWE

A mobile-first code editor and file browser built with React Native and Expo. PocketSWE provides a clean, intuitive interface for viewing and exploring code on mobile devices with syntax highlighting and theme support.

## Features

### 📁 File Explorer

- Browse directory trees with expandable/collapsible folders
- Color-coded file type icons
- Full-width tap targets optimized for mobile
- Alternating row backgrounds for better readability
- Real-time file tree data fetching with SWR

### 📝 Code Editor

- Read-only code viewer with syntax highlighting
- Line numbers with dynamic width calculation
- Horizontal scrolling for long lines
- Syntax highlighting for:
  - JavaScript/TypeScript (keywords, functions, types)
  - Strings, numbers, and literals
  - Comments (inline and full-line)
  - Boolean and nullish values
- Smart comment detection (avoids false positives in URLs)

### 🎨 Theme Support

- Light and dark mode support
- Theme-aware syntax highlighting colors
- Adaptive UI elements that respond to system theme
- VS Code-inspired color schemes:
  - Light mode: Traditional VS Code Light+ colors
  - Dark mode: VS Code Dark+ colors

### 📱 Mobile Optimized

- Safe area handling to avoid status bar overlap
- Responsive layouts that adapt to screen size
- Font scaling support for accessibility
- Smooth scrolling with proper touch targets
- Optimized for iPhone and Android devices

## Tech Stack

- **Framework**: [Expo](https://expo.dev) + React Native
- **Routing**: Expo Router (file-based routing)
- **Data Fetching**: SWR (stale-while-revalidate)
- **Styling**: React Native StyleSheet with theme system
- **Icons**: Expo Vector Icons (@expo/vector-icons)
- **Type Safety**: TypeScript

## Project Structure

```
PocketSWE/
├── app/                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx      # Files tab (file explorer)
│   │   └── explore.tsx    # Editor tab (code viewer)
│   └── _layout.tsx
├── components/            # Reusable UI components
│   ├── file-explorer.tsx  # File tree component
│   ├── themed-text.tsx    # Theme-aware text
│   └── themed-view.tsx    # Theme-aware view
├── constants/
│   └── theme.ts          # Theme colors and tokens
├── hooks/                # Custom React hooks
│   ├── use-color-scheme.ts
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

PocketSWE requires a backend server to provide file tree and file contents data:

- **File Tree Endpoint**: `GET http://localhost:3000/tree`
  - Returns an array of `TreeItem` objects with file/directory structure
- **File Contents Endpoint**: `GET http://localhost:3000/file/:filePath`
  - Returns file contents with path information

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

- Uses SWR for automatic caching, revalidation, and error handling
- Centralized fetcher function in `services/fetcher.ts`
- Custom hooks for file tree and file contents

### Theming

- `useThemeColor` hook provides consistent theming across components
- `ThemedText` and `ThemedView` components automatically adapt to theme
- Syntax highlighter uses `useColorScheme` for theme-aware colors

### Code Organization

- Separation of concerns: components, services, hooks, and utils
- TypeScript interfaces for type safety
- Modular components for reusability

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Syntax highlighting colors inspired by VS Code
- Built with [Expo](https://expo.dev) and [React Native](https://reactnative.dev)
