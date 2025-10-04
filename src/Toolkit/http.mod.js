/* eslint-disable no-unused-vars */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponseHeaders,
  RawAxiosResponseHeaders,
} from "axios";

/**
 * @template T
 * @typedef {Object} Result
 * @property {boolean} success - Indicates if the request was successful
 * @property {T|null} data - The data returned, or null if no data is available
 * @property {number} status - The HTTP status code
 * @property {string} statusText - The HTTP status text
 * @property {RawAxiosResponseHeaders|AxiosResponseHeaders} headers - The headers from the response
 * @property {AxiosRequestConfig} config - The Axios request configuration used
 */

/**
 * GET method
 * @param {string} url
 * @param {[x: string]: string} headers
 * @param {number} timeout
 * @param {number} maxRedirects
 * @returns {Result} 取得伺服器回應
 */
export async function GET(url, headers, timeout = 15000, maxRedirects) {
  const config = {
    method: "get",
    url: url,
    headers: headers,
    timeout: timeout,
  };
  //code 3xx 在一般情況下歸納成錯誤處理，這裡直接歸納回來
  if (maxRedirects === 0) {
    config.maxRedirects = maxRedirects;
    config.validateStatus = function (status) {
      return status >= 200 && status < 303;
    };
  }
  if (waitRateMS !== 0) await Sleep(GetRateLimit());
  cache = new Date();
  try {
    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config,
    };
  } catch (error) {
    return HandleAxiosError(error);
  }
}

/**
 * OST method
 * @param {string} url
 * @param {[x: string]: string} headers
 * @param {*} content
 * @param {number} timeout
 * @param {number} maxRedirects
 * @returns
 */
export async function POST(
  url,
  header,
  content,
  timeout = 15000,
  maxRedirects,
) {
  const config = {
    method: "post",
    url: url,
    data: content,
    headers: header,
    timeout: timeout,
  };
  //code 3xx 在一般情況下歸納成錯誤處理，這裡直接歸納回來
  if (maxRedirects === 0) {
    config.maxRedirects = maxRedirects;
    config.validateStatus = function (status) {
      return status >= 200 && status < 303;
    };
  }
  if (waitRateMS !== 0) await Sleep(GetRateLimit());
  cache = new Date();
  try {
    const response = await axios(config);
    return {
      success: true,
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: response.config,
    };
  } catch (error) {
    return HandleAxiosError(error);
  }
}
/*
  依照速率阻塞線程。
*/
export function Sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let waitRateMS = 0;
let cache = new Date();
// 一分鐘可接受次數
export const SetRatePerMin = (ms) => {
  waitRateMS = 60000 / ms;
};

export const GetRateLimit = () => {
  const minus = new Date().getMilliseconds() - cache.getMilliseconds();

  return minus <= 0 ? 0 : waitRateMS - minus;
};

/**
 * 錯誤處理函式
 * @param {AxiosError} error
 * @returns {Result}
 */
function HandleAxiosError(error) {
  // 伺服器回應的錯誤
  if (error.response) {
    console.error(`❌ 請求失敗： ${error.config.url}
      狀態碼: ${error.response.status}
      訊息: ${error.response.statusText}
      資料: ${JSON.stringify(error.response.data)}`);
  } else if (error.request) {
    console.error("❌ 請求已發送，但未收到回應。"); // 沒有收到回應
  } else {
    console.error(`❌ 發生錯誤: ${error.message}`); // 發送請求時發生的其他錯誤
  }
  return {
    success: false,
    data: null,
    status: error.response.status || 0,
    statusText: error.response.statusText || "Unknown Error",
    headers: error.response.headers || {},
    config: error.config, // 確保這裡的 config 是 AxiosRequestConfig 類型
  };
}
