#!/usr/bin/env node
/* eslint-disable n/no-extraneous-import */

import { confirm, input, select, Separator } from "@inquirer/prompts";
import { join } from "path";
import { rm } from "fs/promises";
import globals from "./globals.ts";
import launchSequence from "./launch.sequence.ts";

const choices = [
  {
    name: "JavaScript",
    value: "javascript",
    description: "Create a Node.JS project with JavaScript Tookit",
  },
  {
    name: "TypeScript",
    value: "typescript",
    description: "Create a Node.JS project with TypeScript Tookit",
  },
  new Separator(),
  {
    name: "Developer",
    value: "null",
    disabled: "view https://github.com/kwangsing3/ks3-toolkit",
  },
];

(async () => {
  //1. 決定專案名稱、類型(JS/TS)
  globals.projectname = process.argv.includes("--vscode")
    ? "vscode-genFolder"
    : await input({ message: "輸入創建的專案名稱" });
  globals.projectname =
    globals.projectname === "" ? "genFolder" : globals.projectname;
  globals.projecttype =
    ((process.env["type"] ??
      (await select({
        message: "選擇使用的語言類型 ",
        choices: choices,
      }))) as "javascript" | "typescript") ?? "javascript"; // read env, then or read input, at last default as javascript
  const answer = process.argv.includes("--vscode")
    ? true
    : await confirm({ message: "Continue?" });
  if (!answer) return;
  if (process.argv.includes("--vscode"))
    await rm(join(process.cwd(), globals.projectname), {
      recursive: true,
      force: true,
    });
  //
  //2. 依照標籤設定生成項目
  await launchSequence();
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    console.log("done");
  });

/*
 加入 prograss bar?
 加入 CLI  字型色彩?
*/
