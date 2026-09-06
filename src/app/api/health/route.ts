export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({
    ok: true,
    service: 'dor101',
    time: new Date().toISOString(),
  });
}
