import {exec} from 'child_process';
import {promisify} from 'util';
import iconv from 'iconv-lite';

// Promisify exec to use async/await
const execPromise = promisify(exec);

export default async function (cmd: string, path?: string) {
  try {
    path = path ?? process.cwd();
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
      stderr: `Error: ${(error as {message: string})?.['message'] || error}`,
    };
  }
}
