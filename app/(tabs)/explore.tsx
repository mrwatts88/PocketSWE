import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { PixelRatio, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TabScrubberClassic } from "@/components/tab-scrubber-classic";
import { TabScrubberDrag } from "@/components/tab-scrubber-drag";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useOpenFiles } from "@/hooks/use-open-files";
import { useTabMode } from "@/hooks/use-tab-mode";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useFileContents } from "@/services/editor/use-file-contents";
import { HighlightedLine } from "@/utils/syntax-highlighter";

export default function TabTwoScreen() {
  const { activeFile, closeFile, closeAllFiles } = useOpenFiles();
  const { tabMode } = useTabMode();
  const { content, error, isLoading } = useFileContents(activeFile || undefined);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const codeLineEven = useThemeColor({}, "codeLineEven");
  const codeLineOdd = useThemeColor({}, "codeLineOdd");
  const codeBackground = useThemeColor({}, "codeBackground");
  const selectedLineColor = useThemeColor({}, "selectedLine");

  const lines = useMemo(() => {
    return content ? content.split("\n") : [];
  }, [content]);

  // Clear selection immediately when active file changes (before content loads)
  useEffect(() => {
    setSelectedLine(null);
  }, [activeFile]);

  const maxLineNumber = lines.length;
  const lineNumberWidth = useMemo(() => {
    // Calculate width based on the number of digits in max line number
    const digits = maxLineNumber.toString().length;
    const fontScale = PixelRatio.getFontScale();
    const baseCharWidth = 10; // Base width per character
    const basePadding = 8; // Base padding
    return (digits * baseCharWidth + basePadding) * fontScale;
  }, [maxLineNumber]);

  return (
    <ThemedView style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {!activeFile ? (
          <ThemedView style={styles.placeholder}>
            <FontAwesome name="file-code-o" size={48} color="#9BA1A6" style={styles.placeholderIcon} />
            <ThemedText style={styles.placeholderTitle}>No File Selected</ThemedText>
            <ThemedText style={styles.placeholderMessage}>Select a file from the Files tab to view its contents</ThemedText>
            <Pressable style={[styles.settingsButton, styles.placeholderButton, { backgroundColor: "#0a7ea4" }]} onPress={() => router.navigate("/")}>
              <FontAwesome name="folder" size={16} color="#fff" />
              <ThemedText style={styles.settingsButtonText}>Browse Files</ThemedText>
            </Pressable>
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <FontAwesome name="exclamation-triangle" size={48} color="#ef4444" style={styles.errorIcon} />
            <ThemedText style={styles.errorTitle}>Connection Error</ThemedText>
            <ThemedText style={styles.errorMessage}>Unable to load file contents. Please check your daemon URL in settings.</ThemedText>
            <Pressable style={[styles.settingsButton, { backgroundColor: "#ef4444" }]} onPress={() => router.navigate("/settings")}>
              <FontAwesome name="gear" size={16} color="#fff" />
              <ThemedText style={styles.settingsButtonText}>Open Settings</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <ThemedView style={[styles.contentContainer, { backgroundColor: codeBackground }]}>
            <ThemedView style={[styles.fileHeader, { borderBottomColor: codeLineOdd }]}>
              <Pressable style={styles.closeAllButton} onPress={closeAllFiles}>
                <FontAwesome name="times-circle" size={20} color="#9BA1A6" />
              </Pressable>
              <ThemedText type="defaultSemiBold" style={styles.fileName}>
                {activeFile}
              </ThemedText>
              <Pressable style={styles.closeButton} onPress={() => activeFile && closeFile(activeFile)}>
                <FontAwesome name="times" size={16} color="#9BA1A6" />
              </Pressable>
            </ThemedView>
            {tabMode === "classic" ? <TabScrubberClassic /> : <TabScrubberDrag />}
            <ScrollView style={styles.scrollView}>
              {isLoading ? (
                <ThemedView style={styles.loadingContainer}>
                  <ThemedText style={styles.loadingText}>Loading file contents...</ThemedText>
                </ThemedView>
              ) : content ? (
                <ThemedView style={styles.codeWrapper}>
                  <ThemedView style={styles.lineNumberColumn}>
                    {lines.map((line, index) => {
                      const lineNumber = index + 1;
                      const isEven = index % 2 === 0;
                      const isSelected = selectedLine === lineNumber;
                      const backgroundColor = isSelected ? selectedLineColor : isEven ? codeLineOdd : codeLineEven;
                      return (
                        <Pressable key={index} style={[styles.lineNumberRow, { backgroundColor }]} onPress={() => setSelectedLine(lineNumber)}>
                          <ThemedText style={[styles.lineNumber, { width: lineNumberWidth }]}>
                            {lineNumber.toString().padStart(maxLineNumber.toString().length, " ")}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </ThemedView>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.codeScroll}
                    contentContainerStyle={styles.codeScrollContent}
                  >
                    {lines.map((line, index) => {
                      const lineNumber = index + 1;
                      const isEven = index % 2 === 0;
                      const isSelected = selectedLine === lineNumber;
                      const backgroundColor = isSelected ? selectedLineColor : isEven ? codeLineOdd : codeLineEven;
                      return (
                        <Pressable key={index} style={[styles.codeLine, { backgroundColor }]} onPress={() => setSelectedLine(lineNumber)}>
                          <ThemedView style={styles.codeTextContainer}>
                            <HighlightedLine line={line} />
                          </ThemedView>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </ThemedView>
              ) : (
                <ThemedView style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>Empty file</ThemedText>
                </ThemedView>
              )}
            </ScrollView>
          </ThemedView>
        )}
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
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  placeholderIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  placeholderMessage: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  placeholderButton: {
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
    color: "#ef4444",
  },
  errorMessage: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  settingsButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fileHeader: {
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  closeAllButton: {
    padding: 8,
  },
  fileName: {
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    padding: 16,
  },
  loadingText: {
    textAlign: "center",
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  emptyText: {
    opacity: 0.5,
    fontStyle: "italic",
  },
  codeWrapper: {
    flexDirection: "row",
  },
  lineNumberColumn: {},
  lineNumberRow: {
    height: 20,
    paddingLeft: 12,
  },
  codeScroll: {
    flex: 1,
  },
  codeScrollContent: {
    flexGrow: 1,
    flexDirection: "column",
  },
  codeLine: {
    height: 20,
    width: "100%",
  },
  lineNumber: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
    paddingRight: 8,
  },
  codeTextContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    backgroundColor: "transparent",
  },
});
