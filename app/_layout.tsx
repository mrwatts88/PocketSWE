import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { HostUrlProvider } from "@/components/host-url-provider";
import { OpenFilesProvider } from "@/components/open-files-provider";
import { TabModeProvider } from "@/components/tab-mode-provider";
import { ThemeProvider as AppThemeProvider } from "@/components/theme-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

function ThemedNavigationProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <HostUrlProvider>
          <OpenFilesProvider>
            <TabModeProvider>
              <ThemedNavigationProvider>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
                </Stack>
                <StatusBar style="auto" />
              </ThemedNavigationProvider>
            </TabModeProvider>
          </OpenFilesProvider>
        </HostUrlProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
