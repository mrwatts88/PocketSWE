import { fetcher } from "@/services/fetcher";
import { TreeItem } from "@/utils/file-tree";
import { useHostUrl } from "@/hooks/use-host-url";
import useSWR from "swr";

interface FileTreeResponse {
  root: string;
  tree: TreeItem[];
}

export function useFileTree() {
  const { url } = useHostUrl();
  const fileTreeUrl = url ? `${url}/tree` : null;

  const { data, error, isLoading } = useSWR<FileTreeResponse>(fileTreeUrl, fileTreeUrl ? fetcher : null);

  return {
    root: data?.root,
    treeData: data?.tree,
    error,
    isLoading,
  };
}
