interface Date {
  /**
   * 【Toolkit擴展】- 從`Date`轉換成DataBase可接受的`datetime`格式。
   * @returns {string}
   * @memberof Date
   * @function
   * @example
   * ```javascript
   * new Date().convertToDateTime()
   * //2025-01-27 11:01:39
   * ```
   */
  convertToDateTime(): string;
}
