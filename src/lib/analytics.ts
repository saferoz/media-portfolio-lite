type AnalyticsEvent = 'portfolio_request_clicked' | 'contact_email_clicked' | 'cv_clicked' | 'film_started';
type EventProperties = { action_location: string; project_id?: string; project_category?: string };
type Capture = (event: AnalyticsEvent, properties: EventProperties & { page_path: string }) => void;

// Installed once by client instrumentation only on the production hostname.
let capture: Capture | undefined;
export function enableAnalytics(handler: Capture) { capture = handler; }

export function trackEvent(event: AnalyticsEvent, properties: EventProperties) {
  if (!capture || typeof window === 'undefined') return;
  try { capture(event, { ...properties, page_path: window.location.pathname }); }
  catch { /* Analytics must never interrupt navigation or playback. */ }
}
