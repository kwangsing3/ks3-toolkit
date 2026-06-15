import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  GET,
  POST,
  PUT,
  PATCH,
  DELETE,
  SetRatePerMin,
  GetRateLimit,
} from "../Toolkit/http.mod.js";

/**
 * http.mod 測試。
 * 全程以替換 globalThis.fetch 的方式 mock，不會打任何外部網路。
 * Run: node --test build/src/tests/http.mod.test.js
 */

const realFetch = globalThis.fetch;

interface Capture {
  url: string;
  init: RequestInit;
}

/**
 * 替換 globalThis.fetch，回傳一個會被填入每次呼叫參數的陣列。
 */
function mockFetch(
  handler: (url: string, init: RequestInit) => Response | Promise<Response>,
): Capture[] {
  const calls: Capture[] = [];
  globalThis.fetch = ((input: unknown, init: RequestInit = {}) => {
    const url = String(input);
    calls.push({ url, init });
    return Promise.resolve(handler(url, init));
  }) as typeof fetch;
  return calls;
}

function jsonResponse(body: unknown, status = 200, statusText?: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { "content-type": "application/json" },
  });
}

describe("http.mod (fetch)", () => {
  afterEach(() => {
    globalThis.fetch = realFetch;
    SetRatePerMin(0); // 關閉節流，避免殘留狀態影響後續測試
  });

  test("GET 2xx JSON → success 與解析後的 data", async () => {
    mockFetch(() => jsonResponse({ id: 1 }));
    const r = await GET<{ id: number }>("https://x.test/a");
    assert.equal(r.success, true);
    assert.deepEqual(r.data, { id: 1 });
    assert.equal(r.error, null);
    assert.equal(r.status, 200);
  });

  test("404 → success:false、data:null、error 含狀態碼", async () => {
    mockFetch(() => new Response("not found", { status: 404, statusText: "Not Found" }));
    const r = await GET("https://x.test/missing");
    assert.equal(r.success, false);
    assert.equal(r.data, null);
    assert.match(r.error ?? "", /404/);
  });

  test("text/plain 回應 → data 為純字串", async () => {
    mockFetch(
      () =>
        new Response("hello", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }),
    );
    const r = await GET<string>("https://x.test/t");
    assert.equal(r.success, true);
    assert.equal(r.data, "hello");
  });

  test("空 body → data 為 null", async () => {
    mockFetch(() => new Response(null, { status: 204 }));
    const r = await GET("https://x.test/empty");
    assert.equal(r.success, true);
    assert.equal(r.data, null);
  });

  test("POST 物件 → 序列化為 JSON 並自動帶 Content-Type", async () => {
    const calls = mockFetch(() => jsonResponse({}));
    await POST("https://x.test/p", { name: "Tom" });
    assert.equal(calls[0]!.init.method, "POST");
    assert.equal(calls[0]!.init.body, JSON.stringify({ name: "Tom" }));
    const headers = calls[0]!.init.headers as Record<string, string>;
    assert.equal(headers["Content-Type"], "application/json");
  });

  test("POST 字串 → 原樣送出且不覆蓋既有 Content-Type", async () => {
    const calls = mockFetch(() => jsonResponse({}));
    await POST("https://x.test/p", "raw=1", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    assert.equal(calls[0]!.init.body, "raw=1");
    const headers = calls[0]!.init.headers as Record<string, string>;
    assert.equal(headers["Content-Type"], "application/x-www-form-urlencoded");
  });

  test("params → 序列化接到 URL，null/undefined 略過", async () => {
    const calls = mockFetch(() => jsonResponse({}));
    await GET("https://x.test/s", {
      params: { a: 1, b: "two", skip: null, gone: undefined },
    });
    assert.equal(calls[0]!.url, "https://x.test/s?a=1&b=two");
  });

  test("URL 已含 ? → 用 & 串接 params", async () => {
    const calls = mockFetch(() => jsonResponse({}));
    await GET("https://x.test/s?x=0", { params: { a: 1 } });
    assert.equal(calls[0]!.url, "https://x.test/s?x=0&a=1");
  });

  test("各 method 送出正確的 HTTP 動詞", async () => {
    const calls = mockFetch(() => jsonResponse({}));
    await GET("https://x.test/");
    await POST("https://x.test/", {});
    await PUT("https://x.test/", {});
    await PATCH("https://x.test/", {});
    await DELETE("https://x.test/");
    assert.deepEqual(
      calls.map((c) => c.init.method),
      ["GET", "POST", "PUT", "PATCH", "DELETE"],
    );
  });

  test("timeout(TimeoutError) → success:false、status:0、error 提到 timeout", async () => {
    mockFetch(() => {
      throw new DOMException("timed out", "TimeoutError");
    });
    const r = await GET("https://x.test/slow", { timeout: 10 });
    assert.equal(r.success, false);
    assert.equal(r.status, 0);
    assert.match(r.error ?? "", /timeout/i);
  });

  test("網路錯誤(TypeError) → error 歸到 Network error", async () => {
    mockFetch(() => {
      throw new TypeError("fetch failed");
    });
    const r = await GET("https://x.test/down");
    assert.equal(r.success, false);
    assert.match(r.error ?? "", /Network error/);
  });

  test("SetRatePerMin(0) → 關閉節流，GetRateLimit 為 0", () => {
    SetRatePerMin(0);
    assert.equal(GetRateLimit(), 0);
  });

  test("設定速率後，請求完 GetRateLimit 回傳剩餘等待且不超過間隔", async () => {
    mockFetch(() => jsonResponse({}));
    SetRatePerMin(60); // 每分鐘 60 次 → 間隔 1000ms
    await GET("https://x.test/r"); // 把 lastRequestAt 設為 now
    const wait = GetRateLimit();
    assert.ok(wait > 0, `expected >0, got ${wait}`);
    assert.ok(wait <= 1000, `expected <=1000, got ${wait}`);
  });
});
