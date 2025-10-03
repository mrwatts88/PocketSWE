import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useCommandHistory } from "@/hooks/use-command-history";
import { useTerminalWebSocket } from "@/hooks/use-terminal-websocket";
import { useThemeColor } from "@/hooks/use-theme-color";

/**
 * Blinking terminal cursor component
 */
function TerminalCursor({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 530,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 530,
          useNativeDriver: true,
        }),
      ])
    );

    blink.start();

    return () => {
      blink.stop();
    };
  }, [opacity]);

  return <Animated.View style={[styles.cursor, { backgroundColor: color, opacity }]} />;
}

export default function TerminalScreen() {
  const [command, setCommand] = useState("");
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Use WebSocket hook
  const { connectionState, isExecuting, outputEntries, executeCommand, cancelCommand, clearOutput } = useTerminalWebSocket();

  // Use command history hook
  const { history, addCommand, removeCommand, getFilteredCommands } = useCommandHistory();

  const codeBackground = useThemeColor({}, "codeBackground");
  const codeLineOdd = useThemeColor({}, "codeLineOdd");
  const themeBackground = useThemeColor({}, "background");

  // Terminal-specific theme colors
  const terminalBackground = useThemeColor({}, "terminalBackground");
  const terminalCommand = useThemeColor({}, "terminalCommand");
  const terminalOutput = useThemeColor({}, "terminalOutput");
  const terminalError = useThemeColor({}, "terminalError");
  const terminalPrompt = useThemeColor({}, "terminalPrompt");
  const terminalPlaceholder = useThemeColor({}, "terminalPlaceholder");
  const terminalBorder = useThemeColor({}, "terminalBorder");

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    // Use a small delay to ensure content is rendered before scrolling
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
    return () => clearTimeout(timer);
  }, [outputEntries]);

  // Auto-scroll when chip area visibility changes (affects layout)
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 10);
    return () => clearTimeout(timer);
  }, [command]);

  // Keep input focused when isExecuting changes
  useEffect(() => {
    // Maintain focus when execution state changes
    if (inputRef.current && connectionState === "connected") {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isExecuting, connectionState]);

  const handleSubmit = () => {
    if (!command.trim()) return;

    // Add to history
    addCommand(command);

    // Execute command via WebSocket
    executeCommand(command);

    // Clear input and maintain focus
    setCommand("");
    inputRef.current?.clear();

    // Refocus the input after a short delay to ensure it stays focused
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleChipPress = (chipCommand: string) => {
    setCommand(chipCommand);
    // Use a small delay to ensure focus is maintained
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleRemoveChip = (chipCommand: string, event: any) => {
    // Prevent chip press when clicking X
    event.stopPropagation();
    removeCommand(chipCommand);
  };

  const isCommandInHistory = (cmd: string): boolean => {
    return history.includes(cmd);
  };

  const handleCancel = () => {
    cancelCommand();
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
      default:
        return "";
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "#4CAF50";
      case "connecting":
        return "#FFC107";
      case "disconnected":
      case "error":
        return "#FF6B6B";
      default:
        return terminalPlaceholder;
    }
  };

  const renderOutput = () => {
    const outputElements = outputEntries.map((entry, index) => {
      let color;
      switch (entry.type) {
        case "command":
          color = terminalCommand;
          break;
        case "stdout":
          color = terminalOutput;
          break;
        case "stderr":
        case "error":
          color = terminalError;
          break;
        default:
          color = terminalOutput;
      }

      return (
        <ThemedText key={index} style={[styles.outputText, { color }, entry.type === "command" && styles.commandText]}>
          {entry.text}
        </ThemedText>
      );
    });

    // Show cursor at the end if not executing and connected
    if (!isExecuting && connectionState === "connected") {
      outputElements.push(
        <View key="cursor-line" style={styles.cursorLine}>
          <ThemedText style={[styles.outputText, { color: terminalPrompt }]}>{">"}</ThemedText>
          {command && <ThemedText style={[styles.outputText, { color: terminalOutput, marginLeft: 4 }]}>{command}</ThemedText>}
          <TerminalCursor color={terminalPrompt} />
        </View>
      );
    }

    // Show empty state if no output
    if (outputEntries.length === 0) {
      return (
        <View>
          <ThemedText style={[styles.placeholder, { color: terminalPlaceholder }]}>Status: {getConnectionStatusText()}</ThemedText>
          {!isExecuting && connectionState === "connected" && (
            <View style={[styles.cursorLine, { marginTop: 16 }]}>
              <ThemedText style={[styles.outputText, { color: terminalPrompt }]}>{">"}</ThemedText>
              {command && <ThemedText style={[styles.outputText, { color: terminalOutput, marginLeft: 4 }]}>{command}</ThemedText>}
              <TerminalCursor color={terminalPrompt} />
            </View>
          )}
        </View>
      );
    }

    return outputElements;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: themeBackground }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ThemedView style={[styles.contentContainer, { backgroundColor: codeBackground }]}>
          {/* Header */}
          <ThemedView style={[styles.header, { borderBottomColor: codeLineOdd }]}>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor() }]} />
            </View>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              Terminal
            </ThemedText>
            <View style={styles.headerActions}>
              {isExecuting && (
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={clearOutput} style={styles.clearButton}>
                <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Output */}
          <ScrollView
            ref={scrollViewRef}
            style={[styles.outputContainer, { backgroundColor: terminalBackground }]}
            contentContainerStyle={styles.outputContent}
          >
            {renderOutput()}
          </ScrollView>

          {/* Command Suggestions Chips */}
          {getFilteredCommands(command).length > 0 && (
            <View style={{ flexGrow: 0, flexShrink: 0 }}>
              <ScrollView
                horizontal
                style={[styles.chipsContainer, { backgroundColor: terminalBackground, borderTopColor: terminalBorder }]}
                contentContainerStyle={styles.chipsContent}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {getFilteredCommands(command).map((cmd, index) => {
                  const isHistory = isCommandInHistory(cmd);
                  return (
                    <TouchableOpacity
                      key={`${cmd}-${index}`}
                      style={[styles.chip, { backgroundColor: codeLineOdd, borderColor: terminalBorder }]}
                      onPress={() => handleChipPress(cmd)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={[styles.chipText, { color: terminalOutput }]} numberOfLines={1}>
                        {cmd}
                      </ThemedText>
                      {isHistory && (
                        <TouchableOpacity
                          style={styles.chipDeleteButton}
                          onPress={(e) => handleRemoveChip(cmd, e)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons name="close-circle" size={16} color={terminalError} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: terminalBackground, borderTopColor: terminalBorder }]}>
            <ThemedText style={[styles.prompt, { color: terminalPrompt }]}>{">"}</ThemedText>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: terminalOutput }]}
              value={command}
              onChangeText={setCommand}
              onSubmitEditing={handleSubmit}
              placeholder="Enter command..."
              placeholderTextColor={terminalPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              returnKeyType="send"
              blurOnSubmit={false}
              keyboardType="default"
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isExecuting || !command.trim() || connectionState !== "connected"}
              style={styles.sendButton}
            >
              <Ionicons
                name="send"
                size={20}
                color={isExecuting || !command.trim() || connectionState !== "connected" ? terminalPlaceholder : terminalPrompt}
              />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    paddingTop: 0,
    paddingBottom: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusContainer: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: "#FFC107",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  outputContainer: {
    flex: 1,
  },
  outputContent: {
    padding: 12,
    paddingBottom: 24,
  },
  outputText: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
  commandText: {
    fontWeight: "600",
  },
  placeholder: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  chipsContainer: {
    borderTopWidth: 1,
  },
  chipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    lineHeight: 18,
  },
  chipDeleteButton: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  prompt: {
    fontFamily: Fonts.mono,
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  cursorLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  cursor: {
    width: 8,
    height: 16,
    marginLeft: 4,
  },
  sendButton: {
    padding: 8,
  },
});
