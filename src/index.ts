#!/usr/bin/env node
/* eslint-disable n/no-extraneous-import */

import globals from './globals';
import {confirm, input, select, Separator} from '@inquirer/prompts';
import launchSequence from './launch.sequence';
const choices = [
  {
    name: 'JavaScript',
    value: 'javascript',
    description: 'Create a Node.JS project with JavaScript Tookit',
  },
  {
    name: 'TypeScript',
    value: 'typescript',
    description: 'Create a Node.JS project with TypeScript Tookit',
  },
  new Separator(),
  {
    name: 'Developer',
    value: 'null',
    disabled: 'view https://github.com/kwangsing3/ks3-toolkit',
  },
];

(async () => {
  //1. 決定專案名稱、類型(JS/TS)
  globals.projectname = await input({message: '輸入創建的專案名稱'});
  globals.projecttype = await select({
    message: '選擇使用的語言類型 ',
    choices: choices,
  });
  const answer = await confirm({message: 'Continue?'});
  if (!answer) return;
  //2. 依照標籤生成項目
  await launchSequence();
})()
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    console.log('done');
  });

/*
 加入 prograss bar?
 加入 CLI  字型色彩?
*/
