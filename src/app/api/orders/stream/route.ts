import { getAdminSession } from "@/server/auth/adminSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const streamPath = process.env.CORE_ADMIN_ORDERS_STREAM_PATH?.trim();

  if (!streamPath) {
    return new Response(
      "Core orders stream path is not configured. Set CORE_ADMIN_ORDERS_STREAM_PATH and update docs/contracts/consumer-core-mapping.md.",
      { status: 501 },
    );
  }

  const session = await getAdminSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const baseUrl = process.env.CORE_API_BASE_URL?.trim();

  if (!baseUrl) {
    return new Response("CORE_API_BASE_URL is required.", { status: 500 });
  }

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = streamPath.startsWith("/") ? streamPath : `/${streamPath}`;
  const upstreamUrl = `${normalizedBase}${normalizedPath}`;

  const upstream = await fetch(upstreamUrl, {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${session.accessToken}`,
    },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Failed to open upstream stream.", { status: upstream.status || 502 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
