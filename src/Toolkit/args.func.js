// 分析帶入的標頭屬性

/**
 * 獲取呼叫執行時的標籤內容。
 * @example
 * ```bash
 * $ node src/index.js --flag=debugs
 * ```
 * ``` typescript
 * //index.js
 * const args = GetArgs();
 * //args = {"flag":"debugs"}
 * ```
 */
export function GetArgs() {
  const args = {};
  process.argv.slice(2).map((element) => {
    const matches = element.match("--([a-zA-Z0-9]+)=(.*)");
    if (matches) {
      args[matches[1]] = matches[2].replace(/^['"]/, "").replace(/['"]$/, "");
    }
  });
  return args;
}
