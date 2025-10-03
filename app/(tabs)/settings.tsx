import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mutate } from "swr";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useHostUrl } from "@/hooks/use-host-url";
import { useTabMode } from "@/hooks/use-tab-mode";
import { useTheme } from "@/components/theme-provider";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function SettingsScreen() {
  const { url, setUrl, clearUrl, testConnection } = useHostUrl();
  const { tabMode, setTabMode } = useTabMode();
  const { themeMode, setThemeMode } = useTheme();
  const [inputUrl, setInputUrl] = useState(url || "");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  // Sync input with current URL when it changes
  useEffect(() => {
    if (url) {
      setInputUrl(url);
    }
  }, [url]);

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const dangerColor = useThemeColor({}, "danger");
  const codeLineOdd = useThemeColor({}, "codeLineOdd");

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setInputUrl(newUrl);
    setConnectionStatus("idle");
  };

  const handleClear = async () => {
    Alert.alert("Clear URL", "Are you sure you want to clear daemon URL? This will reset to localhost:3000.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await clearUrl();
            setInputUrl("http://localhost:3000");
            setConnectionStatus("idle");
            Alert.alert("Success", "Host URL cleared successfully");
          } catch {
            Alert.alert("Error", "Failed to clear URL");
          }
        },
      },
    ]);
  };

  const handleConnect = async () => {
    if (!inputUrl.trim() || !isValidUrl(inputUrl.trim())) {
      Alert.alert("Error", "Please enter a valid URL first");
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus("idle");

    try {
      // Test the connection with the input URL first
      const isConnected = await testConnection(inputUrl.trim());

      if (isConnected) {
        // Only save if connection succeeds
        await setUrl(inputUrl.trim());
        setConnectionStatus("success");

        // Refresh SWR caches to reload data with new connection
        mutate(() => true); // This will revalidate all SWR caches

        Alert.alert("Success", "Successfully connected and saved!");
      } else {
        setConnectionStatus("error");
        Alert.alert("Connection Failed", "Could not connect to the host. Please check the URL and ensure the server is running.");
      }
    } catch {
      setConnectionStatus("error");
      Alert.alert("Error", "Failed to connect");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "success":
        return "#10b981"; // green
      case "error":
        return dangerColor;
      default:
        return textColor;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "success":
        return "✓ Connected";
      case "error":
        return "✗ Connection failed";
      default:
        return "Not tested";
    }
  };

  return (
    <ThemedView style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
          <ThemedView style={styles.section}>
            <ThemedText type="title">Settings</ThemedText>
            <ThemedText style={styles.description}>Configure your PocketSWE application</ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Instructions</ThemedText>
            <ThemedText style={styles.instructions}>
              1. Enter the URL of your PocketSWE daemon{"\n"}
              2. Click &apos;Connect&apos; to test and save the URL{"\n"}
              3. The URL is only saved if connection succeeds{"\n"}
              {"\n"}
              Make sure your daemon is running before connecting.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Daemon URL</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: codeLineOdd,
                  color: textColor,
                  borderColor: codeLineOdd,
                },
              ]}
              value={inputUrl}
              onChangeText={handleUrlChange}
              placeholder="http://localhost:3000"
              placeholderTextColor={textColor + "80"}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <ThemedView style={styles.statusContainer}>
              <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>Status: {getStatusText()}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
              <Pressable style={[styles.button, { backgroundColor: tintColor }]} onPress={handleConnect} disabled={isTestingConnection}>
                <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>{isTestingConnection ? "Connecting..." : "Connect"}</ThemedText>
              </Pressable>

              <Pressable style={[styles.button, styles.dangerButton, { backgroundColor: dangerColor }]} onPress={handleClear}>
                <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>Reset to Default</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Current URL</ThemedText>
            <ThemedText style={styles.currentUrl}>{url || "Not configured"}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Tab Interface</ThemedText>
            <ThemedText style={styles.description}>Choose how you interact with open file tabs</ThemedText>

            <ThemedView style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  tabMode === "classic" && { backgroundColor: tintColor },
                  tabMode !== "classic" && { backgroundColor: codeLineOdd },
                ]}
                onPress={() => setTabMode("classic")}
              >
                <ThemedText style={[styles.buttonText, { color: tabMode === "classic" ? backgroundColor : textColor }]}>Classic Tabs</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.button, tabMode === "drag" && { backgroundColor: tintColor }, tabMode !== "drag" && { backgroundColor: codeLineOdd }]}
                onPress={() => setTabMode("drag")}
              >
                <ThemedText style={[styles.buttonText, { color: tabMode === "drag" ? backgroundColor : textColor }]}>Drag Preview</ThemedText>
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.instructions}>
              Classic: Scrollable tabs with close buttons{"\n"}
              Drag Preview: Fixed tabs with drag-to-switch interaction
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Theme</ThemedText>
            <ThemedText style={styles.description}>Choose your preferred color scheme</ThemedText>

            <ThemedView style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  themeMode === "light" && { backgroundColor: tintColor },
                  themeMode !== "light" && { backgroundColor: codeLineOdd },
                ]}
                onPress={() => setThemeMode("light")}
              >
                <ThemedText style={[styles.buttonText, { color: themeMode === "light" ? backgroundColor : textColor }]}>☀️ Light</ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  themeMode === "dark" && { backgroundColor: tintColor },
                  themeMode !== "dark" && { backgroundColor: codeLineOdd },
                ]}
                onPress={() => setThemeMode("dark")}
              >
                <ThemedText style={[styles.buttonText, { color: themeMode === "dark" ? backgroundColor : textColor }]}>🌙 Dark</ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.button,
                  themeMode === "system" && { backgroundColor: tintColor },
                  themeMode !== "system" && { backgroundColor: codeLineOdd },
                ]}
                onPress={() => setThemeMode("system")}
              >
                <ThemedText style={[styles.buttonText, { color: themeMode === "system" ? backgroundColor : textColor }]}>📱 System</ThemedText>
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.instructions}>
              Light: Always use light theme{"\n"}
              Dark: Always use dark theme{"\n"}
              System: Follow iOS system settings
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  description: {
    marginTop: 8,
    opacity: 0.7,
  },
  input: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: "monospace",
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  dangerButton: {
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  currentUrl: {
    marginTop: 8,
    fontFamily: "monospace",
    fontSize: 14,
    opacity: 0.8,
  },
  instructions: {
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.7,
  },
});
