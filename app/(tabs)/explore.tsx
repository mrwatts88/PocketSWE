import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { PixelRatio, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useFileContents } from "@/services/editor/use-file-contents";

export default function TabTwoScreen() {
  const { filePath } = useLocalSearchParams<{ filePath?: string }>();
  const { content, error, isLoading } = useFileContents(filePath);
  const errorColor = useThemeColor({}, "danger");

  const lines = useMemo(() => {
    return content ? content.split("\n") : [];
  }, [content]);

  const maxLineNumber = lines.length;
  const lineNumberWidth = useMemo(() => {
    // Calculate width based on the number of digits in max line number
    const digits = maxLineNumber.toString().length;
    const fontScale = PixelRatio.getFontScale();
    const baseCharWidth = 8; // Base width per character
    const basePadding = 8; // Base padding
    return (digits * baseCharWidth + basePadding) * fontScale;
  }, [maxLineNumber]);

  return (
    <ThemedView style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView>
          {!filePath ? (
            <ThemedView style={styles.placeholder}>
              <ThemedText type="subtitle">Code Editor</ThemedText>
              <ThemedText>Select a file from the Files tab to view its contents</ThemedText>
            </ThemedView>
          ) : (
            <ThemedView>
              <ThemedView style={styles.fileHeader}>
                <ThemedText type="defaultSemiBold">{filePath}</ThemedText>
              </ThemedView>
              {isLoading && <ThemedText style={styles.loadingText}>Loading file contents...</ThemedText>}
              {error && <ThemedText style={[styles.errorText, { color: errorColor }]}>Error loading file: {error.message}</ThemedText>}
              {content && (
                <ThemedView>
                  {lines.map((line, index) => {
                    const lineNumber = index + 1;
                    const isEven = index % 2 === 0;

                    return (
                      <ThemedView key={index} style={[styles.codeLine, isEven ? styles.codeLineOdd : styles.codeLineEven]}>
                        <ThemedText style={[styles.lineNumber, { width: lineNumberWidth }]}>
                          {lineNumber.toString().padStart(maxLineNumber.toString().length, " ")}
                        </ThemedText>
                        <ThemedText style={styles.codeText}>{line || " "}</ThemedText>
                      </ThemedView>
                    );
                  })}
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
  placeholder: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  fileHeader: {
    padding: 12,
  },
  codeLine: {
    flexDirection: "row",
    minHeight: 20,
  },
  codeLineEven: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  codeLineOdd: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  lineNumber: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    textAlign: "right",
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  loadingText: {
    padding: 16,
  },
  errorText: {
    padding: 16,
  },
});
