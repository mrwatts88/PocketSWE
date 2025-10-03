import { useTheme } from '@/components/theme-provider';

/**
 * Returns the active color scheme (light or dark)
 * Respects user's theme preference (light/dark/system)
 */
export function useColorScheme() {
  const { activeColorScheme } = useTheme();
  return activeColorScheme;
}
