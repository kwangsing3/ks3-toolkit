import {mkdirSync, writeFileSync} from 'fs';
import GTSQueue from './queue/GTS.queue';
import NPMQueue from './queue/NPM.queue';
import globals from './globals';
import {join} from 'path';
import {cp, readdir} from 'fs/promises';

export default async () => {
  const tarPath = join(process.cwd(), globals.projectname);
  const typeExt = globals.projecttype === 'javascript' ? 'js' : 'ts';
  //create project file structure
  const README = `
# ${globals.projectname}
generate by ks3-toolkit
  `;
  await mkdirSync(tarPath, {recursive: true});
  await writeFileSync(join(tarPath, `index.${typeExt}`), helloworld);
  await writeFileSync(join(tarPath, 'README.md'), README);
  //copy modulers
  const filenames = await readdir(join('src/Toolkit'));
  for (const name of filenames) {
    if (name.endsWith(typeExt))
      await cp(
        join('src', 'Toolkit', name),
        join(tarPath, 'src', 'toolkit', name),
      ).catch(() => {});
  }
  //gts first
  await GTSQueue();
  //npm
  await NPMQueue();
};

const helloworld = "console.log('Hello from Toolkit');";
