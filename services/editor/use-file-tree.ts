import { fetcher } from "@/services/fetcher";
import { TreeItem } from "@/utils/file-tree";
import { useHostUrl } from "@/hooks/use-host-url";
import useSWR from "swr";

export function useFileTree() {
  const { url } = useHostUrl();
  const fileTreeUrl = url ? `${url}/tree` : null;

  const { data, error, isLoading } = useSWR<TreeItem[]>(fileTreeUrl, fileTreeUrl ? fetcher : null);

  return {
    treeData: data,
    error,
    isLoading,
  };
}
