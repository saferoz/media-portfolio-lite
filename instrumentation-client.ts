import posthog from 'posthog-js';
import { enableAnalytics } from './src/lib/analytics';

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (window.location.hostname === 'media.radenhanifa.com' && projectToken && apiHost) {
  posthog.init(projectToken, {
    api_host: apiHost,
    defaults: '2026-05-30',
    autocapture: false,
    disable_session_recording: true,
  });
  enableAnalytics((event, properties) => { posthog.capture(event, properties); });
}
