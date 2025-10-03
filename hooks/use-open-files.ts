import { createContext, useContext, useEffect, useState } from 'react';

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

  // Don't load state from storage - start fresh each time
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // No-op functions - don't persist open files
  const persistOpenFiles = async (files: string[]) => {
    // Intentionally empty - don't persist
  };

  const persistActiveFile = async (filePath: string | null) => {
    // Intentionally empty - don't persist
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