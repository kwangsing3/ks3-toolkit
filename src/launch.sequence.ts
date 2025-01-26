import {mkdirSync} from 'fs';
import GTSQueue from './queue/GTS.queue';
import NPMQueue from './queue/NPM.queue';
import globals from './globals';

export default async () => {
  //create file
  await mkdirSync(globals.projectname, {recursive: true});
  //npm
  await NPMQueue();
  //gts
  await GTSQueue();
  //copy modulers
};
