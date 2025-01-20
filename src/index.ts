#!/usr/bin/env node

import {mkdirSync} from 'fs';

(async () => {
  console.log('Hello');
  await mkdirSync('debugFolder');
})()
  .catch(() => {})
  .finally(() => {});

/*
 加入 prograss bar?
 加入 CLI  字型色彩?
*/
