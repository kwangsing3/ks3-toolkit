import {join} from 'path';
import exec from '../exec';
import globals from '../globals';

export default async () => {
  if (globals['projecttype'] !== 'typescript') return;
  //
  const tarPath = join(process.cwd(), globals.projectname);

  await exec('gts init -y', tarPath)
    .catch(() => {})
    .finally(() => {
      console.log('【Toolkit】: gts init');
    });
};
