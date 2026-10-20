import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";
import { formatApiCall } from "utils/proxy/api-helpers";

import widget from "./widget";

describe("sabnzbd widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it.each([
    ["https://sabnzbd.example", "/api"],
    ["https://sabnzbd.example/", "/api"],
    ["https://example.test/sabnzbd/", "/sabnzbd/api"],
  ])("uses the API route without a redirect for %s", (baseUrl, pathname) => {
    const url = new URL(formatApiCall(widget.api, { url: baseUrl, key: "test-key", endpoint: "queue" }));

    expect(url.protocol).toBe("https:");
    expect(url.pathname).toBe(pathname);
    expect(Object.fromEntries(url.searchParams)).toEqual({ apikey: "test-key", output: "json", mode: "queue" });
  });
});
