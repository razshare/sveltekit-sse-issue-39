import { source } from 'sveltekit-sse';

export function load({ url }) {
  const searchParams = new URLSearchParams(url.search);

  const connection = source(`/events?${searchParams}`, {
    cache: false,
    close({ status, connect, xSseId, isLocal }) {
      if (isLocal) {
        return;
      }
      console.log('Closed', { status, xSseId, isLocal });
      console.log('reconnecting...');
      connect();
    },
    open({ status, xSseId, isLocal }) {
      console.log('Opened', { status, xSseId, isLocal });
    }
  });

  /**
   * @type {import('svelte/store').Readable<null|import('./events/+server.js').Quote>}
   */
  const quote = connection.select('cat-quote').json(function or({ error, previous, raw }) {
    console.warn(`Could not parse "${raw}" as json, reverting back to ${previous}. ${error}`);
    return previous;
  });

  return {
    quote
  };
}
