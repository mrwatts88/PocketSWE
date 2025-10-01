import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FileTypeColors } from "@/constants/theme";
import { useOpenFiles } from "@/hooks/use-open-files";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useFileTree } from "@/services/editor/use-file-tree";
import { TreeItem, getFileIcon } from "@/utils/file-tree";

export function FileExplorer() {
  const { root, treeData, error, isLoading } = useFileTree();
  const { openFile } = useOpenFiles();
  const codeLineEven = useThemeColor({}, "codeLineEven");
  const codeLineOdd = useThemeColor({}, "codeLineOdd");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const renderTreeItem = (item: TreeItem, level: number = 0, index: number = 0) => {
    const isDirectory = item.type === "dir";
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = isDirectory && item.children && item.children.length > 0;

    const icon = isDirectory ? { name: "folder" as const, color: FileTypeColors.folder } : getFileIcon(item.name);

    const handlePress = () => {
      if (isDirectory) {
        toggleFolder(item.path);
      } else {
        // Open file and navigate to editor tab
        openFile(item.path);
        router.navigate("/explore");
      }
    };

    const isEven = index % 2 === 0;

    return (
      <ThemedView key={item.path}>
        <Pressable
          style={({ pressed }) => [
            styles.treeItemTouchable,
            { paddingLeft: level * 20 + 16 },
            { backgroundColor: isEven ? codeLineOdd : codeLineEven },
            pressed && styles.treeItemPressed,
          ]}
          onPress={handlePress}
        >
          {isDirectory && hasChildren && (
            <FontAwesome
              name={isExpanded ? "chevron-down" : "chevron-right"}
              size={12}
              color={icon.color}
              style={styles.expandIcon}
            />
          )}
          <FontAwesome name={icon.name} size={20} color={icon.color} />
          <ThemedText style={styles.treeText}>{item.name}</ThemedText>
        </Pressable>
        {isDirectory && isExpanded && item.children?.map((child, childIndex) =>
          renderTreeItem(child, level + 1, index + childIndex + 1)
        )}
      </ThemedView>
    );
  };

  if (isLoading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <FontAwesome name="exclamation-triangle" size={48} color="#ef4444" style={styles.errorIcon} />
        <ThemedText style={styles.errorTitle}>Connection Error</ThemedText>
        <ThemedText style={styles.errorMessage}>
          Unable to load file tree. Please check your daemon URL in settings.
        </ThemedText>
        <Pressable
          style={[styles.settingsButton, { backgroundColor: "#ef4444" }]}
          onPress={() => router.navigate("/settings")}
        >
          <FontAwesome name="gear" size={16} color="#fff" />
          <ThemedText style={styles.settingsButtonText}>Open Settings</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (!treeData) {
    return <ThemedText>No data available</ThemedText>;
  }

  return (
    <ThemedView style={styles.treeContainer}>
      {root && (
        <ThemedView style={styles.rootHeader}>
          <FontAwesome name="folder-open" size={20} color={FileTypeColors.folder} />
          <ThemedText style={styles.rootText}>{root}</ThemedText>
        </ThemedView>
      )}
      {treeData.map((item, index) => renderTreeItem(item, 0, index))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  treeContainer: {
    marginTop: 8,
  },
  rootHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  rootText: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "monospace",
    marginLeft: 12,
  },
  treeItemTouchable: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    minHeight: 44, // iOS recommended minimum touch target
  },
  treeItemPressed: {
    opacity: 0.7,
  },
  expandIcon: {
    marginRight: 8,
    width: 12,
  },
  treeText: {
    fontSize: 16,
    fontFamily: "monospace",
    marginLeft: 12,
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 22,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  settingsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
  },
});
