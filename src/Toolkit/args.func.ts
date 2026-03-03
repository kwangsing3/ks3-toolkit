/**
 * 解析命令行标志参数
 */

/**
 * 獲取呼叫執行時的標籤內容。
 * @returns 解析的命令行參數對象，鍵值對形式
 * @example
 * ```bash
 * $ node ./build/index.js --flag=debugs --mode=production
 * ```
 * ``` typescript
 * //index.ts
 * const args = GetArgs();
 * //args = {"flag":"debugs", "mode":"production"}
 * ```
 */
export function GetArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  const argsPattern = /^--([a-zA-Z0-9_-]+)=(.*)$/;

  process.argv.slice(2).forEach((element) => {
    const matches = element.match(argsPattern);
    if (matches) {
      const key = matches[1]!;
      let value = matches[2]!;
      // 移除首尾引號
      value = value.replace(/^['"]/, "").replace(/['"]$/, "");
      args[key] = value;
    }
  });

  return args;
}
