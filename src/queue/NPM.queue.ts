import {join} from 'path';
import globals from '../globals';
import exec from '../exec';

export default async () => {
  const curPath = join(process.cwd(), globals.projectname);
  const {stdout, stderr} = await exec('dir', curPath);
  console.log(stdout);
};
