import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { useHostUrl } from "@/hooks/use-host-url";
import { useThemeColor } from "@/hooks/use-theme-color";

interface OutputEntry {
  text: string;
  type: "command" | "output" | "error";
}

export default function TerminalScreen() {
  const [outputEntries, setOutputEntries] = useState<OutputEntry[]>([]);
  const [command, setCommand] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const { url } = useHostUrl();
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

  const handleSubmit = async () => {
    if (!command.trim() || !url) return;

    setIsExecuting(true);

    // Add command to output
    setOutputEntries((prev) => [...prev, { text: `> ${command}`, type: "command" }]);

    const currentCommand = command;

    // Clear input immediately using both state and ref
    setCommand("");
    inputRef.current?.clear();

    try {
      const response = await fetch(`${url}/terminal/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command: currentCommand }),
      });

      if (!response.ok) {
        setOutputEntries((prev) => [...prev, { text: `HTTP Error: ${response.status} ${response.statusText}`, type: "error" }]);
        return;
      }

      const data = await response.json();

      if (data.output) {
        setOutputEntries((prev) => [...prev, { text: data.output, type: "output" }]);
      }
    } catch (error) {
      setOutputEntries((prev) => [...prev, { text: `Failed to execute command: ${error}`, type: "error" }]);
    } finally {
      setIsExecuting(false);
      // Ensure command is cleared even if there was an error
      setCommand("");
      inputRef.current?.clear();
    }
  };

  const clearOutput = () => {
    setOutputEntries([]);
  };

  const renderOutput = () => {
    if (outputEntries.length === 0) {
      return <ThemedText style={[styles.placeholder, { color: terminalPlaceholder }]}>Ready to execute commands...</ThemedText>;
    }

    return outputEntries.map((entry, index) => {
      let color;
      switch (entry.type) {
        case "command":
          color = terminalCommand;
          break;
        case "output":
          color = terminalOutput;
          break;
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
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: themeBackground }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ThemedView style={[styles.contentContainer, { backgroundColor: codeBackground }]}>
          {/* Header */}
          <ThemedView style={[styles.header, { borderBottomColor: codeLineOdd }]}>
            <View style={styles.headerSpacer} />
            <ThemedText type="defaultSemiBold" style={styles.title}>
              Terminal
            </ThemedText>
            <TouchableOpacity onPress={clearOutput} style={styles.clearButton}>
              <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Output */}
          <ScrollView style={[styles.outputContainer, { backgroundColor: terminalBackground }]} contentContainerStyle={styles.outputContent}>
            {renderOutput()}
          </ScrollView>

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
              returnKeyType="send"
              editable={!isExecuting}
            />
            <TouchableOpacity onPress={handleSubmit} disabled={isExecuting || !command.trim()} style={styles.sendButton}>
              <Ionicons name="send" size={20} color={isExecuting || !command.trim() ? terminalPlaceholder : terminalPrompt} />
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
  headerSpacer: {
    width: 36, // Match the close button width on the other side
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
  sendButton: {
    padding: 8,
  },
});
