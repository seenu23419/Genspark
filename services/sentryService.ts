/**
 * Sentry integration for error tracking and monitoring.
 * Initialize on app startup before rendering.
 */

const Sentry: any = null;

const loadSentry = async () => {
  // Return stub instead of real module to avoid Vite import errors
  return {
    init: (config: any) => { },
    captureException: (err: any) => { },
    captureMessage: (msg: any) => { },
    Replay: class {
      constructor(config: any) { }
    }
  };
};

export const initSentry = async () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.debug('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  try {
    const SentryModule = await loadSentry();
    if (!SentryModule) return;

    const environment = import.meta.env.MODE;

    SentryModule.init({
      dsn,
      environment,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      integrations: [
        new SentryModule.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
    });

    console.debug('Sentry initialized');
  } catch (err) {
    console.warn('Failed to initialize Sentry:', err);
  }
};

export const captureException = (err: any) => {
  if (!Sentry) return;
  Sentry.captureException(err);
};

export const captureMessage = (message: string) => {
  if (!Sentry) return;
  Sentry.captureMessage(message);
};

export default { initSentry, captureException, captureMessage };

