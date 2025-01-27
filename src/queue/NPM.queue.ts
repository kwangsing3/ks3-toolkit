import {join} from 'path';
import globals from '../globals';
import exec from '../Toolkit/exec.func';
import {writeFileSync} from 'fs';

const steps = [
  'npm install axios@latest',
  'npm install xml2js@latest',
  'npm install --save-dev @types/xml2js',
  'npm install mariadb@latest',
  'npm install',
];

export default async () => {
  const tarPath = join(process.cwd(), globals.projectname);

  // create package.json
  const packageJSON =
    globals.projecttype === 'javascript' ? JSpackage : TSpackage;
  packageJSON.name = globals.projectname;
  await writeFileSync(
    join(tarPath, 'package.json'),
    JSON.stringify(packageJSON, null, 4),
  );

  // NPM steps
  for (const key of steps)
    await exec(key, tarPath)
      .catch(() => {})
      .finally(() => {
        console.log(`【Toolkit】: ${key}`);
      });
};

const TSpackage = {
  name: '',
  version: '0.0.1',
  description: '',
  main: 'build/src/index.js',
  types: 'build/src/index.d.ts',
  files: ['build/src'],
  repository: {
    url: '',
  },
  bin: 'build/src/index.js',
  type: 'module',
  keywords: [],
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
    lint: 'gts lint',
    clean: 'gts clean',
    compile: 'tsc',
    fix: 'gts fix',
    prepare: 'npm.cmd run compile',
    pretest: 'npm.cmd run compile',
    posttest: 'npm.cmd run lint',
  },
};

const JSpackage = {
  name: '',
  version: '0.0.1',
  main: 'index.js',
  bin: 'src/index.js',
  type: 'module',
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
  },
  keywords: [],
  author: '',
  license: 'ISC',
  description: '',
};
