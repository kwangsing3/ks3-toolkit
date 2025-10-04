/* eslint-disable @typescript-eslint/no-explicit-any */
import * as xml2js from "xml2js";

/**
 * 將檔案分析成物件(Object)
 * @param {string} context 傳入自檔案獲得的字串
 * @returns JSON
 */
export async function ParseXML(context) {
  // With parser
  const parser = new xml2js.Parser(/* options */);
  return parser.parseStringPromise(context);
}
