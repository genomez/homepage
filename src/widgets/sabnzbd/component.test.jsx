// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

vi.mock("../../components/widgets/queue/queueEntry", () => ({
  default: ({ title, activity, progress }) => (
    <div data-testid="queue-entry" data-activity={activity} data-progress={progress}>
      {title}
    </div>
  ),
}));

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

  it("uses the default queue limit when limit is omitted", () => {
    const widget = { type: "sabnzbd", url: "http://sabnzbd" };

    renderWithProviders(<Component service={{ widget }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(widget, "queue", { limit: 5 });
  });

  it("passes the configured queue limit to the widget API", () => {
    const widget = { type: "sabnzbd", url: "http://sabnzbd", refreshInterval: 5000 };

    renderWithProviders(<Component service={{ widget }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(widget, "queue", { limit: 5 });
  });

  it("renders only the configured number of queue entries", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        queue: {
          speed: "1.0 M",
          noofslots: 2,
          timeleft: "00:01:00",
          slots: [
            { filename: "First download", mbleft: 5, mb: 10, percentage: "50", status: "Downloading", nzo_id: "1" },
            { filename: "Second download", mbleft: 10, mb: 10, percentage: "0", status: "", nzo_id: "2" },
          ],
        },
      },
      error: undefined,
    });

    const widget = { type: "sabnzbd", enableQueue: true, limit: 1 };

    renderWithProviders(<Component service={{ widget }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByTestId("queue-entry")).toHaveLength(1);
    expect(screen.getByText("First download")).toBeInTheDocument();
    expect(screen.queryByText("Second download")).not.toBeInTheDocument();
    expect(screen.getByTestId("queue-entry")).toHaveAttribute("data-activity", "Downloading");
    expect(screen.getByTestId("queue-entry")).toHaveAttribute("data-progress", "50");
    expect(useWidgetAPI).toHaveBeenCalledWith(widget, "queue", { limit: 1 });
  });
});
