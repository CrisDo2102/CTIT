/** Read an HTTP body with an actual byte limit, even if content-length is absent or incorrect. */
export class BodyTooLargeError extends Error {
  constructor() { super("Body exceeds configured limit"); }
}

export async function readLimitedText(body: Pick<Request, "body" | "text">, maxBytes: number): Promise<string> {
  if (!body.body) {
    const value = await body.text();
    if (new TextEncoder().encode(value).byteLength > maxBytes) throw new BodyTooLargeError();
    return value;
  }
  const reader = body.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        void reader.cancel().catch(() => {});
        throw new BodyTooLargeError();
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
