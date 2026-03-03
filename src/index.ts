#!/usr/bin/env node
/* eslint-disable n/no-extraneous-import */

import { confirm, input, select, Separator } from "@inquirer/prompts";
import { join } from "path";
import { rm } from "fs/promises";
import globals from "./globals.js";
import launchSequence from "./launch.sequence.js";

const choices = [
  {
    name: "JavaScript",
    value: "javascript",
    description: "Create a Node.JS project with JavaScript Toolkit",
  },
  {
    name: "TypeScript",
    value: "typescript",
    description: "Create a Node.JS project with TypeScript Toolkit",
  },
  new Separator(),
  {
    name: "Developer",
    value: "null",
    disabled: "view https://github.com/kwangsing3/ks3-toolkit",
  },
];

(async () => {
  try {
    // 1. 決定專案名稱、類型(JS/TS)
    globals.projectname = process.argv.includes("--vscode")
      ? "vscode-genFolder"
      : await input({ message: "輸入創建的專案名稱 (Enter to use 'genFolder')" });

    globals.projectname =
      globals.projectname.trim() === "" ? "genFolder" : globals.projectname;

    globals.projecttype = (
      process.env["type"] as "javascript" | "typescript" | undefined ??
      (await select({
        message: "選擇使用的語言類型",
        choices: choices,
      }))
    ) as "javascript" | "typescript";

    if (
      globals.projecttype !== "javascript" &&
      globals.projecttype !== "typescript"
    ) {
      console.log("專案類型選擇已取消");
      return;
    }

    const answer = process.argv.includes("--vscode")
      ? true
      : await confirm({ message: "Continue creating project?" });

    if (!answer) {
      console.log("專案創建已取消");
      return;
    }

    // 如果使用 --vscode 標誌，先清空目錄
    if (process.argv.includes("--vscode")) {
      await rm(join(process.cwd(), globals.projectname), {
        recursive: true,
        force: true,
      });
    }

    // 2. 依照標籤設定生成項目
    await launchSequence();
  } catch (err) {
    console.error("錯誤:", err);
    process.exit(1);
  } finally {
    console.log("✅ 完成");
  }
})();
