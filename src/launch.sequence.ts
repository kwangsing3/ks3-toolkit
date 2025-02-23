import NPMQueue from './queue/NPM.queue';
import globals from './globals';
import {join} from 'path';
import {cp, readdir} from 'fs/promises';
import {MKDir, WriteFile} from './Toolkit/fileIO.mod';

export default async () => {
  const tarPath = join(process.cwd(), globals.projectname);
  const typeExt = globals.projecttype === 'javascript' ? 'js' : 'ts';
  //create project file structure
  const README = `
# ${globals.projectname}
generate by ks3-toolkit
  `;

  await MKDir(join(tarPath, 'src', 'toolkit'));
  await WriteFile(join(tarPath, 'src', `index.${typeExt}`), helloworld);
  await WriteFile(join(tarPath, 'README.md'), README);

  //copy modulers
  let source = join(__dirname, '../', '../', 'src', 'Toolkit');
  let filenames = await readdir(source);
  for (const name of filenames) {
    // js declare file: 具體邏輯是.d.的檔案會在js時才保送過去，其餘模式過濾
    if (
      (typeExt === 'js' && name.includes('.d.')) ||
      (name.endsWith(typeExt) && !name.includes('.d.'))
    )
      await cp(join(source, name), join(tarPath, 'src', 'toolkit', name))
        .catch(() => {})
        .finally(() => {
          console.log(`Copy file: ${name}`);
        });
  }

  //npm
  await NPMQueue();
  //
  //
  //base setting
  source = join(__dirname, '../', '../', 'src', 'data');
  filenames = await readdir(source);
  for (const name of filenames) {
    await cp(join(source, name), join(tarPath, name))
      .catch(() => {})
      .finally(() => {
        console.log(`Copy file: ${name}`);
      });
  }
};

const helloworld = `${
  globals.projecttype === 'javascript'
    ? `
import './toolkit/date.func.js';
`
    : ''
}
console.log('Hello from Toolkit');
console.log('Tookit extension test:' + new Date().convertToDateTime());
`;
