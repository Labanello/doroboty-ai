import type { PostHog, PostHogConfig } from "posthog-js";

/**
 * Optional product analytics. It is off unless the build provides a PostHog *project* key
 * (VITE_POSTHOG_KEY, starts with "phc_"; public by design, unlike personal "phx_" API keys).
 * It records only page views and clicks on links and buttons. It never records form values,
 * session replays, cookies or local storage, and honours Do Not Track.
 */
export type AnalyticsConfig = { key: string; host: string };

const DEFAULT_HOST = "https://eu.i.posthog.com";

type Env = Record<string, string | undefined>;

export function analyticsConfig(env: Env = import.meta.env as Env): AnalyticsConfig | null {
  const key = env.VITE_POSTHOG_KEY?.trim();
  if (!key || !/^phc_[A-Za-z0-9]+$/.test(key)) return null;
  const host = (env.VITE_POSTHOG_HOST?.trim() || DEFAULT_HOST).replace(/\/+$/, "");
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(host)) return null;
  return { key, host };
}

export function analyticsEnabled(env?: Env) {
  return analyticsConfig(env) !== null;
}

export function posthogOptions(config: AnalyticsConfig): Partial<PostHogConfig> {
  return {
    api_host: config.host,
    // Page views are sent by hand on every hash route change.
    capture_pageview: false,
    // Clicks on links and buttons only: text fields and their values are never captured.
    autocapture: { dom_event_allowlist: ["click"], element_allowlist: ["a", "button"] },
    // No cookies or local storage: a reload starts a new anonymous visit.
    persistence: "memory",
    person_profiles: "identified_only",
    respect_dnt: true,
    disable_session_recording: true,
    disable_surveys: true,
    disable_web_experiments: true,
    advanced_disable_flags: true,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    rageclick: false,
    save_referrer: false,
    save_campaign_params: false,
  };
}

let starting: Promise<PostHog | null> | null = null;

/** Loads and initialises PostHog once; resolves to null when analytics is off or blocked. */
export function startAnalytics(config: AnalyticsConfig | null = analyticsConfig()) {
  if (!config) return Promise.resolve(null);
  starting ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(config.key, posthogOptions(config));
      return posthog;
    })
    .catch(() => null);
  return starting;
}

let lastPageview = "";

/** Sends a $pageview for the current location (the hash route is part of the URL). */
export function trackPageview() {
  if (!analyticsEnabled() || window.location.href === lastPageview) return;
  lastPageview = window.location.href;
  void startAnalytics().then((posthog) => posthog?.capture("$pageview"));
}

export function resetAnalyticsForTests() {
  starting = null;
  lastPageview = "";
}
