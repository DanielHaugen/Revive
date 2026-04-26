import { type NextRequest } from 'next/server';
import { getRestoreJob } from '@/lib/services/restoreJobs';

/**
 * SSE stream for a restore job's progress.
 *
 * Replays all stored steps from the beginning (safe for reconnection after refresh),
 * then polls every 500 ms for new steps until the job reaches a terminal state.
 * If the client disconnects, the poll loop stops — the job continues running in the
 * background and the client can reconnect at any time to get the latest state.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const jobId = parseInt(params.id, 10);
  if (isNaN(jobId)) {
    return new Response('Invalid job ID', { status: 400 });
  }

  const encoder = new TextEncoder();
  const cancelled = { value: false };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch {
          // Client already disconnected — stop sending
          cancelled.value = true;
        }
      };

      let sentCount = 0;

      while (!cancelled.value) {
        const job = await getRestoreJob(jobId);

        if (!job) {
          send('Error: Restore job not found');
          break;
        }

        const steps = job.steps as string[];
        for (let i = sentCount; i < steps.length; i++) {
          send(steps[i]);
          sentCount = i + 1;
        }

        if (job.status !== 'running') break;

        // Poll interval
        await new Promise<void>((r) => setTimeout(r, 500));
      }

      try { controller.close(); } catch { /* already closed */ }
    },
    cancel() {
      cancelled.value = true;
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
