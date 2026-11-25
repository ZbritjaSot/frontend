/** TEMPORARY: throws so the server-side Sentry path (onRequestError) can be tested. Remove after testing. */
export function GET(): never {
  throw new Error("Sentry test: server route error");
}
