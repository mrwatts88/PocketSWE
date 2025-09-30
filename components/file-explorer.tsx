import { FontAwesome } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FileTypeColors } from "@/constants/theme";
import { useFileTree } from "@/services/editor/use-file-tree";
import { TreeItem, getFileIcon } from "@/utils/file-tree";

export function FileExplorer() {
  const { treeData, error, isLoading } = useFileTree();

  const renderTreeItem = (item: TreeItem, level: number = 0, index: number = 0) => {
    const isDirectory = item.type === "dir";
    const icon = isDirectory ? { name: "folder" as const, color: FileTypeColors.folder } : getFileIcon(item.name);

    const handlePress = () => {
      if (isDirectory) {
        // TODO: Handle folder expansion/collapse
        console.log(`Folder tapped: ${item.path}`);
      } else {
        // Navigate to editor tab with file path
        router.navigate({
          pathname: "/explore",
          params: { filePath: item.path }
        });
      }
    };

    const isEven = index % 2 === 0;

    return (
      <ThemedView key={item.path}>
        <Pressable
          style={({ pressed }) => [
            styles.treeItemTouchable,
            { paddingLeft: level * 20 + 16 },
            isEven ? styles.treeItemOdd : styles.treeItemEven,
            pressed && styles.treeItemPressed,
          ]}
          onPress={handlePress}
        >
          <FontAwesome name={icon.name} size={20} color={icon.color} />
          <ThemedText style={styles.treeText}>{item.name}</ThemedText>
        </Pressable>
        {item.children?.map((child, childIndex) => renderTreeItem(child, level + 1, index + childIndex + 1))}
      </ThemedView>
    );
  };

  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  if (error) {
    return <ThemedText style={styles.errorText}>Error loading tree: {error.message}</ThemedText>;
  }

  if (!treeData) {
    return <ThemedText>No data available</ThemedText>;
  }

  return <ThemedView style={styles.treeContainer}>{treeData.map((item, index) => renderTreeItem(item, 0, index))}</ThemedView>;
}

const styles = StyleSheet.create({
  treeContainer: {
    marginTop: 8,
  },
  treeItemTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    minHeight: 44, // iOS recommended minimum touch target
  },
  treeItemEven: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  treeItemOdd: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  treeItemPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  treeText: {
    fontSize: 16,
    fontFamily: "monospace",
    marginLeft: 12,
    flex: 1,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
});
