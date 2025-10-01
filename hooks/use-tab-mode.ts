import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const TAB_MODE_KEY = "tab_mode";

export type TabMode = "classic" | "drag";

interface TabModeContextType {
  tabMode: TabMode;
  setTabMode: (mode: TabMode) => void;
  isLoading: boolean;
}

const TabModeContext = createContext<TabModeContextType | undefined>(undefined);

export function useTabMode() {
  const context = useContext(TabModeContext);
  if (context === undefined) {
    throw new Error("useTabMode must be used within a TabModeProvider");
  }
  return context;
}

export function useTabModeProvider() {
  const [tabMode, setTabModeState] = useState<TabMode>("classic");
  const [isLoading, setIsLoading] = useState(true);

  // Load tab mode from secure storage on mount
  useEffect(() => {
    const loadTabMode = async () => {
      try {
        const storedMode = await SecureStore.getItemAsync(TAB_MODE_KEY);
        if (storedMode && (storedMode === "classic" || storedMode === "drag")) {
          setTabModeState(storedMode);
        }
      } catch (error) {
        console.error("Failed to load tab mode:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTabMode();
  }, []);

  const setTabMode = async (mode: TabMode) => {
    try {
      await SecureStore.setItemAsync(TAB_MODE_KEY, mode);
      setTabModeState(mode);
    } catch (error) {
      console.error("Failed to save tab mode:", error);
    }
  };

  return {
    tabMode,
    setTabMode,
    isLoading,
  };
}

export { TabModeContext };
