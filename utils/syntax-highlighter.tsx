import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet } from "react-native";

const SYNTAX_COLORS = {
  light: {
    keyword: "#0066CC",
    string: "#A31515",
    comment: "#008000",
    number: "#098658",
    literal: "#0066CC",
    typeKeyword: "#267F99",
    function: "#795E26",
  },
  dark: {
    keyword: "#569CD6",
    string: "#CE9178",
    comment: "#6A9955",
    number: "#B5CEA8",
    literal: "#569CD6",
    typeKeyword: "#4EC9B0",
    function: "#DCDCAA",
  },
};

export const HighlightedLine: React.FC<{ line: string }> = ({ line }) => {
  const colorScheme = useColorScheme();
  const colors = SYNTAX_COLORS[colorScheme ?? "dark"];

  if (!line) {
    return <ThemedText />;
  }

  // Full-line comment (not URLs)
  const commentMatch = line.match(/^(\s*)(?!.*https?:)(\/\/.*)$/);
  if (commentMatch) {
    return (
      <>
        <ThemedText style={styles.codeText}>{commentMatch[1]}</ThemedText>
        <ThemedText style={[styles.comment, { color: colors.comment }]}>{commentMatch[2]}</ThemedText>
      </>
    );
  }

  // Inline comment (not URLs)
  const inlineCommentMatch = line.match(/^(.*?)(?<!:)(\/\/(?!\/))(.*)$/);
  if (inlineCommentMatch && !inlineCommentMatch[1].match(/https?:$/)) {
    const beforeComment = inlineCommentMatch[1];
    const comment = inlineCommentMatch[2] + inlineCommentMatch[4];
    return (
      <>
        {highlightCode(beforeComment, colors)}
        <ThemedText style={[styles.comment, { color: colors.comment }]}>{comment}</ThemedText>
      </>
    );
  }

  return highlightCode(line, colors);
};

const highlightCode = (text: string, colors: any) => {
  let remaining = text;

  // Strings (preserve quotes, allow dashes, escapes, etc)
  remaining = remaining.replace(/(["'`])((?:\\.|(?!\1).)*?)\1/g, "§string§$1$2$1§/string§");

  // Keywords
  remaining = remaining.replace(
    /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|finally|switch|case|break|continue)\b(?![^§]*§\/string§)/g,
    "§keyword§$1§/keyword§"
  );

  // Numbers
  remaining = remaining.replace(/\b(\d+(\.\d+)?)\b(?![^§]*§\/string§)/g, "§number§$1§/number§");

  // Boolean & nullish
  remaining = remaining.replace(/\b(true|false|null|undefined)\b(?![^§]*§\/string§)/g, "§literal§$1§/literal§");

  // Type keywords (TS/JS)
  remaining = remaining.replace(/\b(interface|type|enum|implements|extends)\b(?![^§]*§\/string§)/g, "§typeKeyword§$1§/typeKeyword§");

  // Function names (cheap heuristic: word followed by `(`)
  remaining = remaining.replace(/\b([A-Za-z_]\w*)(?=\s*\()(?![^§]*§\/string§)/g, "§function§$1§/function§");

  // Split + map to styled spans
  return remaining.split(/(§[^§]+§[^§]*?§\/[^§]+§)/).map((chunk, i) => {
    if (chunk.startsWith("§keyword§")) {
      return (
        <ThemedText key={i} style={[styles.keyword, { color: colors.keyword }]}>
          {chunk.replace(/§\/?keyword§/g, "")}
        </ThemedText>
      );
    }
    if (chunk.startsWith("§string§")) {
      return (
        <ThemedText key={i} style={[styles.string, { color: colors.string }]}>
          {chunk.replace(/§\/?string§/g, "")}
        </ThemedText>
      );
    }
    if (chunk.startsWith("§number§")) {
      return (
        <ThemedText key={i} style={[styles.number, { color: colors.number }]}>
          {chunk.replace(/§\/?number§/g, "")}
        </ThemedText>
      );
    }
    if (chunk.startsWith("§literal§")) {
      return (
        <ThemedText key={i} style={[styles.literal, { color: colors.literal }]}>
          {chunk.replace(/§\/?literal§/g, "")}
        </ThemedText>
      );
    }
    if (chunk.startsWith("§typeKeyword§")) {
      return (
        <ThemedText key={i} style={[styles.typeKeyword, { color: colors.typeKeyword }]}>
          {chunk.replace(/§\/?typeKeyword§/g, "")}
        </ThemedText>
      );
    }
    if (chunk.startsWith("§function§")) {
      return (
        <ThemedText key={i} style={[styles.function, { color: colors.function }]}>
          {chunk.replace(/§\/?function§/g, "")}
        </ThemedText>
      );
    }
    return chunk ? (
      <ThemedText key={i} style={styles.codeText}>
        {chunk}
      </ThemedText>
    ) : null;
  });
};

const styles = StyleSheet.create({
  codeText: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "transparent",
  },
  keyword: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
  string: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "transparent",
  },
  comment: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    backgroundColor: "transparent",
  },
  number: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "transparent",
  },
  literal: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    backgroundColor: "transparent",
  },
  typeKeyword: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
    backgroundColor: "transparent",
  },
  function: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "transparent",
  },
});
