import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

const HOST_URL_KEY = "host_url";
const DEFAULT_URL = "http://localhost:3000";

interface HostUrlContextType {
  url: string | null;
  setUrl: (url: string) => Promise<void>;
  clearUrl: () => Promise<void>;
  isLoading: boolean;
  testConnection: (testUrl?: string) => Promise<boolean>;
}

const HostUrlContext = createContext<HostUrlContextType | undefined>(undefined);

export function useHostUrl() {
  const context = useContext(HostUrlContext);
  if (context === undefined) {
    throw new Error("useHostUrl must be used within a HostUrlProvider");
  }
  return context;
}

export function useHostUrlProvider() {
  const [url, setUrlState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load URL from secure storage on mount
  useEffect(() => {
    const loadUrl = async () => {
      try {
        const storedUrl = await SecureStore.getItemAsync(HOST_URL_KEY);
        setUrlState(storedUrl || DEFAULT_URL);
      } catch (error) {
        console.error("Failed to load host URL:", error);
        setUrlState(DEFAULT_URL);
      } finally {
        setIsLoading(false);
      }
    };

    loadUrl();
  }, []);

  const setUrl = async (newUrl: string) => {
    try {
      await SecureStore.setItemAsync(HOST_URL_KEY, newUrl);
      setUrlState(newUrl);
    } catch (error) {
      console.error("Failed to save host URL:", error);
      throw error;
    }
  };

  const clearUrl = async () => {
    try {
      await SecureStore.deleteItemAsync(HOST_URL_KEY);
      setUrlState(DEFAULT_URL);
    } catch (error) {
      console.error("Failed to clear host URL:", error);
      throw error;
    }
  };

  const testConnection = async (testUrl?: string): Promise<boolean> => {
    const urlToTest = testUrl || url;
    if (!urlToTest) return false;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${urlToTest}/health`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.status === 200;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  };

  return {
    url,
    setUrl,
    clearUrl,
    isLoading,
    testConnection,
  };
}

export { HostUrlContext };
