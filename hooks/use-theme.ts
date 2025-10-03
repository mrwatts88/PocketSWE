import { useCallback, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const THEME_KEY = 'app_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Internal hook for managing app theme
 * Use the context version from @/components/theme-provider instead
 * Supports: light, dark, or system (follows iOS settings)
 */
export function useThemeInternal() {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await SecureStore.getItemAsync(THEME_KEY);
        if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Save theme preference
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await SecureStore.setItemAsync(THEME_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  // Get the actual color scheme to use
  const getActiveColorScheme = useCallback((): 'light' | 'dark' => {
    if (themeMode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  return {
    themeMode,
    setThemeMode,
    activeColorScheme: getActiveColorScheme(),
    isLoading,
  };
}
