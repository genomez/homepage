// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/sabnzbd/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sabnzbd" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("sabnzbd.rate")).toBeInTheDocument();
    expect(screen.getByText("sabnzbd.queue")).toBeInTheDocument();
    expect(screen.getByText("sabnzbd.timeleft")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "sabnzbd" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders speed, queue count and time left when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { queue: { speed: "1.0 M", noofslots: 2, timeleft: "00:01:00" } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sabnzbd" } }} />, {
      settings: { hideErrors: false },
    });

    // fromUnits("1.0 M") => 1 * 1024**2
    expectBlockValue(container, "sabnzbd.rate", 1024 ** 2);
    expectBlockValue(container, "sabnzbd.queue", 2);
    expectBlockValue(container, "sabnzbd.timeleft", "00:01:00");
  });

  it("does not enable polling when refreshInterval is omitted", () => {
    const widget = { type: "sabnzbd", url: "http://sabnzbd" };

    renderWithProviders(<Component service={{ widget }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(widget, "queue", { refreshInterval: undefined });
  });

  it("passes the configured refresh interval to the widget API", () => {
    const widget = { type: "sabnzbd", url: "http://sabnzbd", refreshInterval: 5000 };

    renderWithProviders(<Component service={{ widget }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(widget, "queue", { refreshInterval: 5000 });
  });

  it("clamps refresh intervals below one second", () => {
    const widget = { type: "sabnzbd", url: "http://sabnzbd", refreshInterval: 500 };

    renderWithProviders(<Component service={{ widget }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(widget, "queue", { refreshInterval: 1000 });
  });
});
