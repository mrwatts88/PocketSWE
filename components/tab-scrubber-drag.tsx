import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ReanimatedAnimated, { runOnJS } from "react-native-reanimated";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useOpenFiles } from "@/hooks/use-open-files";
import { useThemeColor } from "@/hooks/use-theme-color";

export function TabScrubberDrag() {
  const { openFiles, activeFile, setActiveFile } = useOpenFiles();
  const codeLineEven = useThemeColor({}, "codeLineEven");
  const codeLineOdd = useThemeColor({}, "codeLineOdd");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [highlightedTabIndex, setHighlightedTabIndex] = useState<number | null>(null);
  const currentIndexRef = useRef<number>(-1);
  const fileSetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const screenWidth = Dimensions.get("window").width;
  const padding = 24; // 12px on each side
  const gap = 4 * (openFiles.length - 1); // 4px gap between tabs
  const availableWidth = screenWidth - padding - gap;
  const tabWidth = availableWidth / openFiles.length;

  const switchToFile = useCallback(
    (index: number) => {
      // Only switch if index is valid and different from current
      if (index >= 0 && index < openFiles.length && index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        setDragIndex(index);

        // INSTANT visual feedback - just highlight the tab by index
        setHighlightedTabIndex(index);

        // Light haptic feedback for tab switches
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Clear any pending file set
        if (fileSetTimeoutRef.current) {
          clearTimeout(fileSetTimeoutRef.current);
        }

        // Defer the actual file switching to next tick to avoid blocking highlighting
        fileSetTimeoutRef.current = setTimeout(() => {
          setActiveFile(openFiles[index]);
        }, 0);
      }
    },
    [openFiles, setActiveFile]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fileSetTimeoutRef.current) {
        clearTimeout(fileSetTimeoutRef.current);
      }
    };
  }, []);

  if (openFiles.length === 0) {
    return null;
  }

  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      // Calculate index immediately on touch
      const adjustedX = Math.max(0, event.x - 12);
      const index = Math.floor(adjustedX / (tabWidth + 4));
      runOnJS(switchToFile)(index);
    })
    .onUpdate((event) => {
      // Real-time tracking during drag
      const adjustedX = Math.max(0, event.x - 12);
      const index = Math.floor(adjustedX / (tabWidth + 4));
      runOnJS(switchToFile)(index);
    })
    .onEnd(() => {
      // Clean up drag state
      runOnJS(setDragIndex)(null);
      runOnJS(setHighlightedTabIndex)(null);
      currentIndexRef.current = -1;
    });

  return (
    <ThemedView style={[styles.tabScrubber]}>
      <GestureDetector gesture={panGesture}>
        <ReanimatedAnimated.View style={styles.tabContainer}>
          {openFiles.map((filePath, index) => {
            const fileName = filePath.split("/").pop() || filePath;
            // Use tab index for instant highlighting during drag, otherwise use actual activeFile
            const isActive = highlightedTabIndex !== null ? index === highlightedTabIndex : filePath === activeFile;
            const isDragging = dragIndex === index;

            return (
              <Animated.View
                key={filePath}
                style={[
                  styles.tab,
                  {
                    backgroundColor: isActive ? codeLineOdd : codeLineEven,
                    flex: 1,
                    transform: [{ scale: isDragging ? 1.05 : 1 }],
                  },
                  isActive && { borderTopColor: "#0a7ea4", borderTopWidth: 2 },
                ]}
              >
                <ThemedText style={[styles.tabText, { color: isActive ? "#0a7ea4" : "#9BA1A6" }]} numberOfLines={1}>
                  {fileName}
                </ThemedText>
              </Animated.View>
            );
          })}
        </ReanimatedAnimated.View>
      </GestureDetector>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tabScrubber: {
    paddingVertical: 8,
    maxHeight: 60,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 44,
  },
  tabText: {
    fontSize: 14,
    fontFamily: "monospace",
    textAlign: "center",
  },
});
