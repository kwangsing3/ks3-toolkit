import {join} from 'path';
import exec from '../Toolkit/exec.func';
import globals from '../globals';
import {WriteFile} from '../Toolkit/fileIO.mod';

export default async () => {
  if (globals['projecttype'] !== 'typescript') return;
  //
  const tarPath = join(process.cwd(), globals.projectname);

  await exec('gts init -y', tarPath)
    .catch(() => {})
    .finally(() => {
      console.log('【Toolkit】: gts init');
    });

  await WriteFile(
    join(tarPath, 'tsconfig.json'),
    JSON.stringify(TSconfig, null, 4),
  ).finally(() => {
    console.log(`witefile: ${join(tarPath, 'tsconfig.json')}`);
  });
};
const TSconfig = {
  extends: './node_modules/gts/tsconfig-google.json',
  compilerOptions: {
    rootDir: '.',
    outDir: 'build',
    target: 'ES6',
    module: 'NodeNext',
  },
  include: ['src/**/*.ts', 'test/**/*.ts'],
};
