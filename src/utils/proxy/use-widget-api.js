import useSWR from "swr";

import { formatProxyUrl } from "./api-helpers";

export default function useWidgetAPI(widget, endpoint, queryParams, swrConfig = {}) {
  const config = { ...swrConfig };
  const refreshInterval = widget?.refreshInterval ?? queryParams?.refreshInterval;
  if (refreshInterval) {
    config.refreshInterval = Math.max(1000, refreshInterval);
  }
  let url = formatProxyUrl(widget, endpoint, queryParams);
  if (endpoint === "") {
    url = null;
  }
  const { data, error, mutate } = useSWR(url, config);
  // make the data error the top-level error
  return { data, error: data?.error ?? error, mutate };
}
