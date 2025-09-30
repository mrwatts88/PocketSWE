import { fetcher } from "@/services/fetcher";
import { TreeItem } from "@/utils/file-tree";
import useSWR from "swr";

const FILE_TREE_URL = "http://localhost:3000/tree";

export function useFileTree() {
  const { data, error, isLoading } = useSWR<TreeItem[]>(FILE_TREE_URL, fetcher);

  return {
    treeData: data,
    error,
    isLoading,
  };
}
