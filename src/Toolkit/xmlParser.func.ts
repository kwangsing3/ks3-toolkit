/* eslint-disable @typescript-eslint/no-explicit-any */
import * as xml2js from "xml2js";

/**
 * 將 XML 字符串解析成 JavaScript 物件
 * @param xmlContent 傳入自檔案獲得的 XML 字符串
 * @returns 解析後的 JSON 物件
 * @throws 如果 XML 解析失敗會拋出錯誤
 * @example
 * ```typescript
 * const xmlString = '<root><item>test</item></root>';
 * const json = await ParseXML(xmlString);
 * console.log(json);
 * ```
 */
export async function ParseXML(xmlContent: string): Promise<any> {
  try {
    const parser = new xml2js.Parser({
      normalize: true,
      normalizeTags: true,
    });
    return await parser.parseStringPromise(xmlContent);
  } catch (error) {
    console.error("Error parsing XML:", error);
    throw new Error(`Failed to parse XML: ${String(error)}`);
  }
}
