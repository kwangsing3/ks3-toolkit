import {exec} from 'child_process';
import {promisify} from 'util';
import iconv from 'iconv-lite';

// Promisify exec to use async/await
const execPromise = promisify(exec);
/**
 * 呼叫child_process執行當前環境的終端指令。 (繁體中文相容)
 * @param {string} cmd
 * @param {string | undefined} path
 * @returns
 */
export default async function (cmd, path = undefined) {
  try {
    path = path === undefined ? process.cwd() : path;
    let {stdout, stderr} = await execPromise(cmd, {
      encoding: 'binary',
      cwd: path,
    });
    stdout = iconv.decode(Buffer.from(stdout, 'binary'), 'Big5');
    stderr = iconv.decode(Buffer.from(stderr, 'binary'), 'Big5');
    return {stdout, stderr};
  } catch (error) {
    return {
      stdout: '',
      stderr: `Error: ${error['message'] === undefined ? error : error['message']}`,
    };
  }
}
