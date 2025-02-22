import {join} from 'path';
import globals from '../globals';
import exec from '../Toolkit/exec.func';
import {writeFileSync} from 'fs';
import {WriteFile} from '../Toolkit/fileIO.mod';

const steps = [
  'npm install axios@latest',
  'npm install xml2js@latest',
  'npm install --save-dev @types/xml2js',
  'npm install iconv-lite@latest',
  'npm install mariadb@latest',
];
const tsSteps = [
  'npm install --save-dev typescript@latest',
  'npm install --save-dev gts@latest',
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
  // replace default tsconifg.json
  if (globals['projecttype'] === 'typescript') {
    // GTS steps
    for (const key of tsSteps)
      await exec(key, tarPath)
        .catch(() => {})
        .finally(() => {
          console.log(`【Toolkit】: ${key}`);
        });
    await exec('npm run gtsinit').finally(() => {
      console.log('npm run gtsinit');
    });
    await WriteFile(
      join(tarPath, 'tsconfig.json'),
      JSON.stringify(TSconfig, null, 4),
    ).finally(() => {
      console.log(`witefile: ${join(tarPath, 'tsconfig.json')}`);
    });
  }
  //
  await exec('npm install', tarPath)
    .catch(() => {})
    .finally(() => {
      console.log('【Toolkit】: npm install');
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
    gtsinit: 'gts init -y',
    lint: 'gts lint',
    clean: 'gts clean',
    compile: 'tsc',
    fix: 'gts fix',
    prepare: 'npm.cmd run compile',
    pretest: 'npm.cmd run compile',
    posttest: 'npm.cmd run lint',
    'release:major': 'npx changelogen@latest  --major --release --push',
    'release:minor': 'npx changelogen@latest  --minor --release --push',
    'release:patch': 'npx changelogen@latest  --patch --release --push',
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
    'release:major': 'npx changelogen@latest  --major --release --push',
    'release:minor': 'npx changelogen@latest  --minor --release --push',
    'release:patch': 'npx changelogen@latest  --patch --release --push',
  },
  keywords: [],
  author: '',
  license: 'ISC',
  description: '',
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
