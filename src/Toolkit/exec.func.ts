import { exec } from "child_process";
import { promisify } from "util";
import iconv from "iconv-lite";

interface ExecResult {
  stdout: string;
  stderr: string;
}

// Promisify exec to use async/await
const execPromise = promisify(exec);

/**
 * 呼叫子進程執行當前環境的終端指令（支持繁體中文）
 * @param cmd 要執行的命令
 * @param path 執行目錄，預設為當前工作目錄
 * @returns 包含標準輸出和標準錯誤的物件
 * @throws 不會拋出異常，異常被捕獲並轉為stderr
 * @example
 * ```typescript
 * const result = await exec('npm install', '/path/to/project');
 * console.log(result.stdout);
 * console.log(result.stderr);
 * ```
 */
export default async function (
  cmd: string,
  path?: string,
): Promise<ExecResult> {
  try {
    const workingPath = path ?? process.cwd();
    let { stdout, stderr } = await execPromise(cmd, {
      encoding: "binary",
      cwd: workingPath,
    });

    // 轉換編碼以支持繁體中文
    stdout = iconv.decode(Buffer.from(stdout, "binary"), "Big5");
    stderr = iconv.decode(Buffer.from(stderr, "binary"), "Big5");

    return { stdout, stderr };
  } catch (error) {
    const errorMessage =
      (error as { message?: string })?.message || String(error);
    return {
      stdout: "",
      stderr: `Error: ${errorMessage}`,
    };
  }
}
