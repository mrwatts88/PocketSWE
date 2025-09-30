import { FileTypeColors } from "@/constants/theme";

export interface TreeItem {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: TreeItem[];
}

export const getFileIcon = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (!extension) {
    return { name: "file-o" as const, color: FileTypeColors.default };
  }

  const color = FileTypeColors[extension as keyof typeof FileTypeColors] || FileTypeColors.default;

  // Determine icon type based on file extension
  let iconName: "file-code-o" | "file-text-o" | "file-image-o" | "file-o";

  if (["js", "jsx", "ts", "tsx", "json", "css", "html", "py", "java", "go", "rs"].includes(extension)) {
    iconName = "file-code-o";
  } else if (["md"].includes(extension)) {
    iconName = "file-text-o";
  } else if (["png", "jpg", "jpeg", "gif"].includes(extension)) {
    iconName = "file-image-o";
  } else {
    iconName = "file-o";
  }

  return { name: iconName, color };
};
