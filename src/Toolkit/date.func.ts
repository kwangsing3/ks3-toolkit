declare global {
  interface Date {
    /**
     * 【Toolkit擴展】- 從`Date`轉換成DataBase可接受的`datetime`格式。
     * @returns {string}
     * @function
     * @example
     * ```typescript
     * new Date().ConvertToDateTime()
     * //2025-01-27 11:01:39
     * ```
     */
    convertToDateTime(): string;
  }
}
Date.prototype.convertToDateTime = function (): string {
  return this.toISOString().slice(0, 19).replace("T", " ");
};
