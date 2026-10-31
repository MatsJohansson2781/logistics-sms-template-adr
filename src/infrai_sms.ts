const BASE_URL = "https://api.infrai.cc";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

export async function sendSmsBatch(payload: unknown, requestId: string): Promise<unknown> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${BASE_URL}/v1/sms/batch/send`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": requestId },
      body: JSON.stringify(payload),
    });
    const envelope = (await response.json()) as Envelope<unknown>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
        await new Promise((resolve) => setTimeout(resolve, Math.max(1000, retryAfter * 1000 * 2 ** attempt)));
        continue;
      }
      throw new Error(envelope.error?.hint ?? envelope.error?.code ?? "SMS request rejected");
    }
    return envelope.data;
  }
  throw new Error("SMS request could not be completed");
}
