import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useClaudeWebSocket } from "@/hooks/use-claude-websocket";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function AIScreen() {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { connectionState, sessionId, outputEvents, isLoading, isResumedSession, startSession, sendPrompt, resetSession, addUserMessage } =
    useClaudeWebSocket();

  // Theme colors
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");
  const borderColor = useThemeColor({}, "terminalBorder");
  const placeholderColor = useThemeColor({}, "terminalPlaceholder");
  const outputBackground = useThemeColor({}, "aiBackground");
  const assistantColor = useThemeColor({}, "aiAssistant");
  const userColor = useThemeColor({}, "aiUser");
  const toolColor = useThemeColor({}, "aiTool");
  const errorColor = useThemeColor({}, "aiError");
  const systemColor = useThemeColor({}, "aiSystem");
  const successColor = useThemeColor({}, "aiSuccess");
  const codeLineOdd = useThemeColor({}, "codeLineOdd");

  // Auto-scroll when output changes
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [outputEvents]);

  const handleStartSession = () => {
    if (connectionState !== "connected") {
      Alert.alert("Not Connected", "Please check your daemon URL in settings.");
      return;
    }
    startSession();
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    if (!sessionId) {
      Alert.alert("No Active Session", "Please start a session first.");
      return;
    }

    // Add user message to output immediately for better UX
    addUserMessage(prompt);

    sendPrompt(prompt, sessionId);
    setPrompt("");
    inputRef.current?.clear();
  };

  const handleReset = () => {
    resetSession();
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
        return successColor;
      case "connecting":
        return toolColor;
      case "disconnected":
      case "error":
        return errorColor;
      default:
        return placeholderColor;
    }
  };

  const getSessionStatusText = () => {
    if (!sessionId) return "No Session";
    return "Active";
  };

  const getSessionStatusColor = () => {
    if (sessionId) return successColor;
    return systemColor;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <ThemedView style={[styles.header, { borderBottomColor: codeLineOdd }]}>
          <ThemedText type="title" style={styles.headerTitle}>
            AI Coding
          </ThemedText>
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: getConnectionStatusColor() }]} />
              <ThemedText style={styles.statusText}>{getConnectionStatusText()}</ThemedText>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: getSessionStatusColor() }]} />
              <ThemedText style={styles.statusText}>{getSessionStatusText()}</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Instructions (shown when no session and not loading) */}
        {!sessionId && !isLoading ? (
          <ThemedView style={styles.instructions}>
            <ThemedText style={styles.instructionsTitle}>Getting Started</ThemedText>
            <ThemedText style={styles.instructionsText}>1. Tap &quot;Start Session&quot; to begin a new Claude Code session</ThemedText>
            <ThemedText style={styles.instructionsText}>2. Send prompts to Claude from your mobile device</ThemedText>
          </ThemedView>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={[styles.outputContainer, { backgroundColor: outputBackground }]}
            contentContainerStyle={styles.outputContent}
          >
            {outputEvents.length > 0 ? (
              (() => {
                // Deduplicate events by type and message id (or session_id for system events)
                const seen = new Set();
                const dedupedEvents = outputEvents.filter((evt) => {
                  let key;
                  if (evt.type === "system" && evt.subtype === "init") {
                    key = `system-init-${evt.session_id}`;
                  } else if (evt.type === "assistant" || evt.type === "user") {
                    key = `${evt.type}-${evt.message?.id || evt.uuid}`;
                  } else if (evt.type === "result") {
                    key = `result-${evt.session_id}-${evt.num_turns}`;
                  } else {
                    key = evt.uuid;
                  }

                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });

                return dedupedEvents
                  .map((evt, i) =>
                    renderClaudeEvent(evt, i, isResumedSession, {
                      assistant: assistantColor,
                      user: userColor,
                      tool: toolColor,
                      error: errorColor,
                      system: systemColor,
                    })
                  )
                  .filter((el) => el !== null);
              })()
            ) : sessionId ? (
              <ThemedText style={[styles.placeholderText, { color: placeholderColor }]}>Waiting for Claude output...</ThemedText>
            ) : null}

            {/* Inline loading indicator */}
            {isLoading && (
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size="small" color={tintColor} />
                <ThemedText style={[styles.loadingText, { color: placeholderColor }]}>Claude is thinking...</ThemedText>
              </View>
            )}
          </ScrollView>
        )}

        {/* Controls */}
        <ThemedView style={[styles.controls, { borderTopColor: borderColor }]}>
          {/* Session Control Buttons */}
          <View style={styles.controlButtons}>
            {!sessionId ? (
              <TouchableOpacity
                style={[styles.button, styles.startButton, { backgroundColor: tintColor }]}
                onPress={handleStartSession}
                disabled={connectionState !== "connected"}
              >
                <Ionicons name="play" size={20} color={backgroundColor} />
                <ThemedText style={[styles.buttonText, { color: backgroundColor }]}>Start Session</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, styles.resetButton, { borderColor: tintColor }]} onPress={handleReset}>
                <Ionicons name="refresh" size={20} color={tintColor} />
                <ThemedText style={[styles.buttonTextOutline, { color: tintColor }]}>Reset</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Prompt Input (only shown when session is active) */}
          {sessionId && (
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: textColor, borderColor, backgroundColor }]}
                value={prompt}
                onChangeText={setPrompt}
                placeholder="Enter prompt for Claude..."
                placeholderTextColor={placeholderColor}
                multiline
                maxLength={2000}
                returnKeyType="default"
                blurOnSubmit={false}
              />
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: tintColor }]} onPress={handleSendPrompt} disabled={!prompt.trim()}>
                <Ionicons name="send" size={20} color={backgroundColor} />
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function renderClaudeEvent(
  evt: any,
  i: number,
  isResumedSession: boolean,
  colors: { assistant: string; user: string; tool: string; error: string; system: string }
) {
  // Only show first init message (but not if we resumed a session)
  if (evt.type === "system" && evt.subtype === "init" && !isResumedSession) {
    return (
      <ThemedText key={i} style={[styles.systemText, { color: colors.system }]}>
        🟢 Session started ({evt.session_id})
      </ThemedText>
    );
  }

  // Show assistant messages
  if (evt.type === "assistant") {
    const content = evt.message?.content || [];
    const textContent = content
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n")
      .trim();
    const toolUses = content.filter((c: any) => c.type === "tool_use");

    // Skip empty assistant messages
    if (!textContent && toolUses.length === 0) return null;

    // Render both text and tool use if present
    return (
      <View key={i} style={styles.messageContainer}>
        {toolUses.length > 0 && (
          <ThemedText style={[styles.toolText, { color: colors.tool }]}>🔧 {toolUses.map((t: any) => t.name).join(", ")}</ThemedText>
        )}
        {textContent && (
          <ThemedText style={[styles.assistantText, { color: colors.assistant }]}>
            <ThemedText style={{ fontWeight: "600" }}>Assistant:</ThemedText> {textContent}
          </ThemedText>
        )}
      </View>
    );
  }

  // Show user messages
  if (evt.type === "user") {
    // Skip tool result messages (internal to Claude)
    const hasToolResult = evt.message?.content?.some((c: any) => c.type === "tool_result");
    if (hasToolResult) return null;

    const textContent = evt.message?.content
      ?.filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n")
      .trim();

    if (!textContent) return null;

    return (
      <ThemedText key={i} style={[styles.userText, { color: colors.user }]}>
        <ThemedText style={{ fontWeight: "600", color: colors.user }}>You:</ThemedText> {textContent}
      </ThemedText>
    );
  }

  // Show final result only if it's an error or very different from assistant messages
  if (evt.type === "result") {
    if (evt.is_error) {
      return (
        <ThemedText key={i} style={[styles.errorText, { color: colors.error }]}>
          ❌ Error: {evt.result}
        </ThemedText>
      );
    }
    // Don't show success results as they duplicate assistant messages
    return null;
  }

  // Ignore other system events to reduce noise
  return null;
}

const styles = StyleSheet.create({
  errorText: { marginVertical: 8 },
  systemText: { fontStyle: "italic", marginVertical: 4 },
  messageContainer: { marginBottom: 4, gap: 4 },
  assistantText: { lineHeight: 20 },
  userText: { marginVertical: 4, fontStyle: "italic" },
  toolText: { fontSize: 12, fontStyle: "italic" },
  resultText: {},
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  statusContainer: { flexDirection: "row", gap: 16 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13 },
  instructions: { flex: 1, padding: 16, gap: 8 },
  instructionsTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  instructionsText: { fontSize: 14, lineHeight: 20, opacity: 0.8 },
  loadingIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  loadingText: { fontSize: 13, fontStyle: "italic" },
  outputContainer: { flex: 1 },
  outputContent: { padding: 16 },
  outputText: { fontSize: 13, lineHeight: 20 },
  placeholderText: { fontSize: 14, fontStyle: "italic" },
  controls: { borderTopWidth: 1, padding: 16, gap: 12 },
  controlButtons: { flexDirection: "row", gap: 12 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  startButton: {},
  resetButton: { backgroundColor: "transparent", borderWidth: 1.5 },
  buttonText: { fontSize: 15, fontWeight: "600" },
  buttonTextOutline: { fontSize: 15, fontWeight: "600" },
  inputContainer: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
