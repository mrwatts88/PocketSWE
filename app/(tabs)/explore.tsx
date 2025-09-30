import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useFileContents } from "@/services/editor/use-file-contents";

export default function TabTwoScreen() {
  const { filePath } = useLocalSearchParams<{ filePath?: string }>();
  const { content, error, isLoading } = useFileContents(filePath);

  return (
    <ThemedView style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollContainer}>
          {!filePath ? (
            <ThemedView style={styles.placeholder}>
              <ThemedText type="subtitle">Code Editor</ThemedText>
              <ThemedText>Select a file from the Files tab to view its contents</ThemedText>
            </ThemedView>
          ) : (
            <ThemedView style={styles.fileContainer}>
              <ThemedView style={styles.fileHeader}>
                <ThemedText type="defaultSemiBold">{filePath}</ThemedText>
              </ThemedView>
              {isLoading && <ThemedText>Loading file contents...</ThemedText>}
              {error && <ThemedText style={styles.errorText}>Error loading file: {error.message}</ThemedText>}
              {content && (
                <ThemedView style={styles.codeContainer}>
                  <ThemedText style={styles.codeText}>{content}</ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          )}
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
  placeholder: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  fileContainer: {
    flex: 1,
  },
  fileHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  codeContainer: {
    padding: 16,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: "#ff6b6b",
    padding: 16,
  },
});
