import { fetcher } from "@/services/fetcher";
import { useHostUrl } from "@/hooks/use-host-url";
import useSWR from "swr";

interface FileResponse {
  path: string;
  contents: string;
}

export function useFileContents(filePath?: string) {
  const { url: hostUrl } = useHostUrl();
  const url = filePath && hostUrl ? `${hostUrl}/file/${encodeURIComponent(filePath)}` : null;
  const { data, error, isLoading } = useSWR<FileResponse>(url, url ? fetcher : null);

  return {
    content: data?.contents,
    path: data?.path,
    error,
    isLoading,
  };
}
