import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FileExplorer } from "@/components/file-explorer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FileTypeColors } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useFileTree } from "@/services/editor/use-file-tree";
import { FontAwesome } from "@expo/vector-icons";

export default function HomeScreen() {
  const { root, error } = useFileTree();
  const codeLineOdd = useThemeColor({}, "codeLineOdd");

  return (
    <ThemedView style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea}>
        {error ? (
          <FileExplorer />
        ) : (
          <>
            {root && (
              <ThemedView style={[styles.rootHeader, { borderBottomColor: codeLineOdd }]}>
                <FontAwesome name="folder-open" size={20} color={FileTypeColors.folder} />
                <ThemedText style={styles.rootText}>{root}</ThemedText>
              </ThemedView>
            )}
            <ScrollView style={styles.scrollContainer}>
              <FileExplorer />
            </ScrollView>
          </>
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
  scrollContainer: {
    flex: 1,
  },
  rootHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  rootText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "monospace",
    marginLeft: 12,
  },
});
