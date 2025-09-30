import { fetcher } from "@/services/fetcher";
import useSWR from "swr";

interface FileResponse {
  path: string;
  contents: string;
}

export function useFileContents(filePath?: string) {
  const url = filePath ? `http://localhost:3000/file/${encodeURIComponent(filePath)}` : null;
  const { data, error, isLoading } = useSWR<FileResponse>(url, url ? fetcher : null);

  return {
    content: data?.contents,
    path: data?.path,
    error,
    isLoading,
  };
}
