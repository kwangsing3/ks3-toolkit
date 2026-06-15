/* eslint-disable no-unused-vars */

const DEFAULT_TIMEOUT = 15000;

/**
 * 最終送出的請求設定（取代原本的 AxiosRequestConfig）。
 * @typedef {Object} RequestConfig
 * @property {string} method
 * @property {string} url
 * @property {Object.<string, string>} headers
 * @property {string} [body]
 * @property {number} timeout
 */

/**
 * 統一回覆格式。
 * - `success: true` 時 `data` 有值、`error` 為 null
 * - `success: false` 時 `data` 為 null、`error` 為錯誤訊息字串
 * @template T
 * @typedef {Object} Result
 * @property {boolean} success - 請求是否成功
 * @property {T|null} data - 回傳資料，失敗時為 null
 * @property {number} status - HTTP 狀態碼
 * @property {string} statusText - HTTP 狀態文字
 * @property {Object.<string, string>} headers - 回應標頭
 * @property {RequestConfig} config - 使用的請求設定
 * @property {string|null} error - 失敗時的錯誤訊息，成功時為 null
 */

/**
 * 請求選項。所有欄位皆為可選。
 * @typedef {Object} RequestOptions
 * @property {Object.<string, string>} [headers] - 自訂請求標頭
 * @property {Object.<string, *>} [params] - query string 參數
 * @property {number} [timeout] - 逾時毫秒數，預設 15000
 */

/**
 * 底層請求函式，所有 HTTP method 皆共用此實作。基於原生 fetch。
 * @template T
 * @param {string} method - HTTP 方法
 * @param {string} url - 請求路徑
 * @param {*} [data] - 請求主體
 * @param {RequestOptions} [options] - 請求選項
 * @returns {Promise<Result<T>>}
 */
async function request(method, url, data, options = {}) {
  const headers = { ...(options.headers ?? {}) };
  const finalUrl = appendParams(url, options.params);

  // 序列化請求主體：物件自動轉 JSON 並補上 Content-Type
  let body;
  if (data !== undefined && data !== null) {
    if (typeof data === "string") {
      body = data;
    } else {
      body = JSON.stringify(data);
      if (!hasHeader(headers, "content-type")) {
        headers["Content-Type"] = "application/json";
      }
    }
  }

  const config = {
    method: method.toUpperCase(),
    url: finalUrl,
    headers,
    body,
    timeout: options.timeout ?? DEFAULT_TIMEOUT,
  };

  await throttle();

  try {
    const response = await fetch(finalUrl, {
      method: config.method,
      headers,
      body,
      signal: AbortSignal.timeout(config.timeout),
    });

    const respHeaders = Object.fromEntries(response.headers.entries());
    const parsed = await parseBody(response);

    if (!response.ok) {
      // fetch 不會對非 2xx 拋錯，需自行判斷
      const detail =
        parsed != null
          ? ` Body: ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`
          : "";
      return {
        success: false,
        data: null,
        status: response.status,
        statusText: response.statusText,
        headers: respHeaders,
        config,
        error:
          `Server error - Status: ${response.status} ` +
          `(${response.statusText}). URL: ${finalUrl}.${detail}`,
      };
    }

    return {
      success: true,
      data: parsed,
      status: response.status,
      statusText: response.statusText,
      headers: respHeaders,
      config,
      error: null,
    };
  } catch (error) {
    return toErrorResult(error, config);
  }
}

/**
 * GET method
 * @template T
 * @param {string} url - 請求路徑
 * @param {RequestOptions} [options] - 請求選項
 * @returns {Promise<Result<T>>}
 */
export function GET(url, options) {
  return request("GET", url, undefined, options);
}

/**
 * DELETE method
 * @template T
 * @param {string} url - 請求路徑
 * @param {RequestOptions} [options] - 請求選項
 * @returns {Promise<Result<T>>}
 */
export function DELETE(url, options) {
  return request("DELETE", url, undefined, options);
}

/**
 * POST method
 * @template T
 * @param {string} url - 請求路徑
 * @param {*} [data] - 請求主體
 * @param {RequestOptions} [options] - 請求選項
 * @returns {Promise<Result<T>>}
 */
export function POST(url, data, options) {
  return request("POST", url, data, options);
}

/**
 * PUT method
 * @template T
 * @param {string} url - 請求路徑
 * @param {*} [data] - 請求主體
 * @param {RequestOptions} [options] - 請求選項
 * @returns {Promise<Result<T>>}
 */
export function PUT(url, data, options) {
  return request("PUT", url, data, options);
}

/**
 * PATCH method
 * @template T
 * @param {string} url - 請求路徑
 * @param {*} [data] - 請求主體
 * @param {RequestOptions} [options] - 請求選項
 * @returns {Promise<Result<T>>}
 */
export function PATCH(url, data, options) {
  return request("PATCH", url, data, options);
}

/**
 * 依照毫秒數阻塞當前流程。
 * @param {number} ms - 等待的毫秒數
 * @returns {Promise<void>}
 */
export function Sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let minIntervalMS = 0;
let lastRequestAt = 0;

/**
 * 設定每分鐘可接受的請求次數。設為 0 或負數則關閉速率限制。
 * @param {number} requestsPerMinute - 每分鐘的請求數
 * @returns {void}
 */
export const SetRatePerMin = (requestsPerMinute) => {
  minIntervalMS = requestsPerMinute > 0 ? 60000 / requestsPerMinute : 0;
};

/**
 * 取得距離下一次允許請求還需等待的毫秒數。
 * @returns {number} 需要等待的毫秒數（0 表示可立即請求）
 */
export const GetRateLimit = () => {
  if (minIntervalMS <= 0) return 0;
  const wait = lastRequestAt + minIntervalMS - Date.now();
  return wait > 0 ? wait : 0;
};

/**
 * 依照速率限制等待，並更新最後請求時間。
 * @returns {Promise<void>}
 */
async function throttle() {
  if (minIntervalMS <= 0) return;
  const wait = GetRateLimit();
  if (wait > 0) await Sleep(wait);
  lastRequestAt = Date.now();
}

/**
 * 把 params 物件序列化成 query string 並接到 URL 後方。
 * @param {string} url
 * @param {Object.<string, *>} [params]
 * @returns {string}
 */
function appendParams(url, params) {
  if (!params) return url;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) qs.append(key, String(value));
  }
  const serialized = qs.toString();
  if (!serialized) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${serialized}`;
}

/**
 * 依 Content-Type 解析回應主體：JSON 走 JSON.parse，其餘回傳純文字。空回應回傳 null。
 * @param {Response} response
 * @returns {Promise<*>}
 */
async function parseBody(response) {
  const text = await response.text();
  if (text === "") return null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

/**
 * 大小寫不敏感地判斷標頭是否已存在。
 * @param {Object.<string, string>} headers
 * @param {string} name
 * @returns {boolean}
 */
function hasHeader(headers, name) {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === lower);
}

/**
 * 將 fetch 拋出的例外轉換為統一的失敗 Result。
 * 不在函式內輸出 log，錯誤訊息一律放進 error 欄位，由呼叫端決定如何處理。
 * @template T
 * @param {unknown} error
 * @param {RequestConfig} config
 * @returns {Result<T>}
 */
function toErrorResult(error, config) {
  let message;

  if (error instanceof DOMException && error.name === "TimeoutError") {
    message = `Request timeout after ${config.timeout}ms. URL: ${config.url}`;
  } else if (error instanceof DOMException && error.name === "AbortError") {
    message = `Request aborted. URL: ${config.url}`;
  } else if (error instanceof TypeError) {
    // fetch 在網路層失敗（DNS、連線中斷等）會丟 TypeError
    message = `Network error: ${error.message}. URL: ${config.url}`;
  } else {
    message = `Request error: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }

  return {
    success: false,
    data: null,
    status: 0,
    statusText: "Error",
    headers: {},
    config,
    error: message,
  };
}
