import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

const OPEN_FILES_KEY = 'open_files';
const ACTIVE_FILE_KEY = 'active_file';

interface OpenFilesContextType {
  openFiles: string[];
  activeFile: string | null;
  openFile: (filePath: string) => void;
  closeFile: (filePath: string) => void;
  closeAllFiles: () => void;
  setActiveFile: (filePath: string) => void;
  isLoading: boolean;
}

const OpenFilesContext = createContext<OpenFilesContextType | undefined>(undefined);

export function useOpenFiles() {
  const context = useContext(OpenFilesContext);
  if (context === undefined) {
    throw new Error('useOpenFiles must be used within an OpenFilesProvider');
  }
  return context;
}

export function useOpenFilesProvider() {
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFileState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load state from secure storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const [storedOpenFiles, storedActiveFile] = await Promise.all([
          SecureStore.getItemAsync(OPEN_FILES_KEY),
          SecureStore.getItemAsync(ACTIVE_FILE_KEY),
        ]);

        if (storedOpenFiles) {
          const parsedFiles = JSON.parse(storedOpenFiles);
          setOpenFiles(parsedFiles);
        }

        if (storedActiveFile && storedOpenFiles) {
          const parsedFiles = JSON.parse(storedOpenFiles);
          // Only set active file if it's still in the open files list
          if (parsedFiles.includes(storedActiveFile)) {
            setActiveFileState(storedActiveFile);
          }
        }
      } catch (error) {
        console.error('Failed to load open files state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, []);

  // Persist open files to storage
  const persistOpenFiles = async (files: string[]) => {
    try {
      await SecureStore.setItemAsync(OPEN_FILES_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Failed to save open files:', error);
    }
  };

  // Persist active file to storage
  const persistActiveFile = async (filePath: string | null) => {
    try {
      if (filePath) {
        await SecureStore.setItemAsync(ACTIVE_FILE_KEY, filePath);
      } else {
        await SecureStore.deleteItemAsync(ACTIVE_FILE_KEY);
      }
    } catch (error) {
      console.error('Failed to save active file:', error);
    }
  };

  const openFile = (filePath: string) => {
    setOpenFiles(prev => {
      // Don't add if already open
      if (prev.includes(filePath)) {
        return prev;
      }
      const newFiles = [...prev, filePath];
      persistOpenFiles(newFiles);
      return newFiles;
    });

    // Set as active file
    setActiveFileState(filePath);
    persistActiveFile(filePath);
  };

  const closeFile = (filePath: string) => {
    setOpenFiles(prev => {
      const newFiles = prev.filter(f => f !== filePath);
      persistOpenFiles(newFiles);

      // If closing the active file, switch to another or clear
      if (activeFile === filePath) {
        const newActiveFile = newFiles.length > 0 ? newFiles[newFiles.length - 1] : null;
        setActiveFileState(newActiveFile);
        persistActiveFile(newActiveFile);
      }

      return newFiles;
    });
  };

  const closeAllFiles = () => {
    setOpenFiles([]);
    setActiveFileState(null);
    persistOpenFiles([]);
    persistActiveFile(null);
  };

  const setActiveFile = (filePath: string) => {
    if (openFiles.includes(filePath)) {
      setActiveFileState(filePath);
      persistActiveFile(filePath);
    }
  };

  return {
    openFiles,
    activeFile,
    openFile,
    closeFile,
    closeAllFiles,
    setActiveFile,
    isLoading,
  };
}

export { OpenFilesContext };