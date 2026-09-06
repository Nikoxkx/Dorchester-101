import { realtimeHub, type RealtimeEvent } from '@/lib/realtime';
import { buildNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/notifications/stream — Server-Sent Events.
 *
 * This is the app's single realtime channel. Events:
 *   snapshot — full notification payload on connect
 *   mbta     — MBTA service alerts changed (live)
 *   news     — new articles available from the aggregation
 *   data     — a verified dataset (projects/food/programs) changed server-side
 *
 * Heartbeat comments keep proxies from closing the connection. Clients that
 * cannot hold SSE (offline desktop, restrictive networks) fall back to
 * interval polling via useRealtime() — see src/hooks/useRealtime.ts.
 */
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;

      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };

      const heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
        } catch {
          closed = true;
        }
      }, 25_000);

      // Initial snapshot — the same payload the REST endpoint returns.
      try {
        const notifications = await buildNotifications();
        send('snapshot', {
          notifications,
          total: notifications.length,
          at: new Date().toISOString(),
        });
      } catch {
        send('snapshot', { notifications: [], total: 0, at: new Date().toISOString() });
      }

      const unsubscribe = realtimeHub.subscribe((event: RealtimeEvent) => {
        send(event.type, event.payload);
      });

      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      request.signal.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
