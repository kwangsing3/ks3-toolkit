declare global {
  interface Date {
    /**
     * 【Toolkit擴展】從`Date`轉換成 Database 可接受的`datetime`格式。
     * 轉換為 `YYYY-MM-DD HH:mm:ss` 格式
     * @returns {string} 格式化後的日期時間字符串
     * @example
     * ```typescript
     * new Date().convertToDateTime()
     * // 返回: "2025-01-27 11:01:39"
     * ```
     */
    convertToDateTime(): string;

    /**
     * 【Toolkit擴展】從`Date`轉換成 ISO 日期格式
     * @returns {string} ISO 日期字符串（YYYY-MM-DD）
     * @example
     * ```typescript
     * new Date().toDateString()
     * // 返回: "2025-01-27"
     * ```
     */
    toDateOnlyString(): string;

    /**
     * 【Toolkit擴展】從`Date`轉換成時間格式
     * @returns {string} 時間字符串（HH:mm:ss）
     * @example
     * ```typescript
     * new Date().toTimeOnlyString()
     * // 返回: "11:01:39"
     * ```
     */
    toTimeOnlyString(): string;
  }
}

Date.prototype.convertToDateTime = function (): string {
  return this.toISOString().slice(0, 19).replace("T", " ");
};

Date.prototype.toDateOnlyString = function (): string {
  return this.toISOString().slice(0, 10);
};

Date.prototype.toTimeOnlyString = function (): string {
  return this.toISOString().slice(11, 19);
};

export {};
