import { FontAwesome } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useOpenFiles } from "@/hooks/use-open-files";
import { useThemeColor } from "@/hooks/use-theme-color";

export function TabScrubberClassic() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useOpenFiles();
  const codeLineOdd = useThemeColor({}, "codeLineOdd");
  const codeBackground = useThemeColor({}, "codeBackground");

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <ThemedView style={[styles.tabScrubber, { borderTopColor: codeLineOdd }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
        {openFiles.map((filePath) => {
          const fileName = filePath.split("/").pop() || filePath;
          const isActive = filePath === activeFile;
          return (
            <Pressable
              key={filePath}
              style={[
                styles.tab,
                { backgroundColor: isActive ? codeLineOdd : codeBackground },
                isActive && { borderTopColor: "#0a7ea4", borderTopWidth: 2 },
              ]}
              onPress={() => setActiveFile(filePath)}
            >
              <ThemedText style={[styles.tabText, { color: isActive ? "#0a7ea4" : "#9BA1A6" }]} numberOfLines={1}>
                {fileName}
              </ThemedText>
              <Pressable
                style={styles.tabCloseButton}
                onPress={(e) => {
                  e.stopPropagation();
                  closeFile(filePath);
                }}
              >
                <FontAwesome name="times" size={12} color="#9BA1A6" />
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabScrubber: {
    borderTopWidth: 1,
    paddingVertical: 8,
    maxHeight: 60,
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 120,
    maxWidth: 200,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "monospace",
    flex: 1,
    marginRight: 8,
  },
  tabCloseButton: {
    padding: 4,
    borderRadius: 2,
  },
});
