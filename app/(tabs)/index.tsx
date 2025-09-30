import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FileExplorer } from "@/components/file-explorer";
import { ThemedView } from "@/components/themed-view";
import { useFileTree } from "@/services/editor/use-file-tree";

export default function HomeScreen() {
  const { error } = useFileTree();

  return (
    <ThemedView style={styles.screenContainer}>
      <SafeAreaView style={styles.safeArea}>
        {error ? (
          <FileExplorer />
        ) : (
          <ScrollView style={styles.scrollContainer}>
            <FileExplorer />
          </ScrollView>
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
});
