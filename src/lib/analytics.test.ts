import { beforeEach, describe, expect, it, vi } from "vitest";

const posthog = vi.hoisted(() => ({ init: vi.fn(), capture: vi.fn() }));
vi.mock("posthog-js", () => ({ default: posthog }));

import {
  analyticsConfig,
  posthogOptions,
  resetAnalyticsForTests,
  startAnalytics,
} from "./analytics";

const key = "phc_TestProjectKey123";

describe("analytics configuration", () => {
  it("is off without a key", () => {
    expect(analyticsConfig({})).toBeNull();
    expect(analyticsConfig({ VITE_POSTHOG_KEY: "  " })).toBeNull();
  });

  it("rejects anything that is not a public project key", () => {
    expect(analyticsConfig({ VITE_POSTHOG_KEY: "phx_PersonalApiKeySecret" })).toBeNull();
    expect(analyticsConfig({ VITE_POSTHOG_KEY: "sk-live-123" })).toBeNull();
  });

  it("defaults to the EU host and accepts only https hosts", () => {
    expect(analyticsConfig({ VITE_POSTHOG_KEY: key })).toEqual({
      key,
      host: "https://eu.i.posthog.com",
    });
    expect(
      analyticsConfig({ VITE_POSTHOG_KEY: key, VITE_POSTHOG_HOST: "https://us.i.posthog.com/" })
        ?.host,
    ).toBe("https://us.i.posthog.com");
    expect(
      analyticsConfig({ VITE_POSTHOG_KEY: key, VITE_POSTHOG_HOST: "http://insecure.example" }),
    ).toBeNull();
  });
});

describe("privacy-minded options", () => {
  const options = posthogOptions({ key, host: "https://eu.i.posthog.com" });

  it("captures only clicks on links and buttons, with no recordings or storage", () => {
    expect(options.autocapture).toEqual({
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
    });
    expect(options.disable_session_recording).toBe(true);
    expect(options.persistence).toBe("memory");
    expect(options.respect_dnt).toBe(true);
    expect(options.capture_pageview).toBe(false);
  });
});

describe("starting analytics", () => {
  beforeEach(() => {
    posthog.init.mockClear();
    resetAnalyticsForTests();
  });

  it("never loads PostHog when disabled", async () => {
    expect(await startAnalytics(null)).toBeNull();
    expect(posthog.init).not.toHaveBeenCalled();
  });

  it("initialises once with the project key", async () => {
    const config = { key, host: "https://eu.i.posthog.com" };
    await startAnalytics(config);
    await startAnalytics(config);
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith(
      key,
      expect.objectContaining({ api_host: config.host }),
    );
  });
});
