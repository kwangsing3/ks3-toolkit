import { join } from "path";
import exec from "../Toolkit/exec.func.js";
import { writeFileSync } from "fs";
import { WriteFile } from "../Toolkit/fileIO.mod.js";
import globals from "../globals.js";

const steps = [
  "npm install axios@latest",
  "npm install xml2js@latest",
  "npm install --save-dev @types/xml2js",
  "npm install iconv-lite@latest",
  "npm install mariadb@latest",
];
const tsSteps = ["npm install --save-dev typescript@latest"];
export default async () => {
  const tarPath = join(process.cwd(), globals.projectname);

  // create package.json
  const packageJSON =
    globals.projecttype === "javascript" ? JSpackage : TSpackage;
  packageJSON.name = globals.projectname;
  await writeFileSync(
    join(tarPath, "package.json"),
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
  if (globals["projecttype"] === "typescript") {
    // GTS steps
    for (const key of tsSteps)
      await exec(key, tarPath)
        .catch(() => {})
        .finally(() => {
          console.log(`【Toolkit】: ${key}`);
        });
    await exec("npm run gtsinit").finally(() => {
      console.log("npm run gtsinit");
    });
    await WriteFile(
      join(tarPath, "tsconfig.json"),
      JSON.stringify(TSconfig, null, 4),
    ).finally(() => {
      console.log(`witefile: ${join(tarPath, "tsconfig.json")}`);
    });
  }
  //
  await exec("npm install", tarPath)
    .catch(() => {})
    .finally(() => {
      console.log("【Toolkit】: npm install");
    });
};

const TSpackage = {
  name: "",
  version: "0.0.1",
  description: "",
  main: "build/src/index.js",
  types: "build/src/index.d.ts",
  files: ["build/src"],
  repository: {
    url: "",
  },
  bin: "build/src/index.js",
  type: "module",
  keywords: [],
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
    gtsinit: "gts init -y",
    lint: "gts lint",
    clean: "gts clean",
    compile: "tsc",
    fix: "gts fix",
    prepare: "npm run compile",
    pretest: "npm run compile",
    posttest: "npm run lint",
    "release:major": "npx changelogen@latest  --major --release --push",
    "release:minor": "npx changelogen@latest  --minor --release --push",
    "release:patch": "npx changelogen@latest  --patch --release --push",
  },
};

const JSpackage = {
  name: "",
  version: "0.0.1",
  main: "index.js",
  type: "module",
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
    "release:major": "npx changelogen@latest  --major --release --push",
    "release:minor": "npx changelogen@latest  --minor --release --push",
    "release:patch": "npx changelogen@latest  --patch --release --push",
  },
  keywords: [],
  author: "",
  license: "ISC",
  description: "",
};
const TSconfig = {
  compilerOptions: {
    /* 語言與環境 */
    target: "ES2022" /* 編譯到最新的 ES 標準 */,
    module: "NodeNext" /* 使用 Node.js 的 ESM 模組系統 */,
    moduleResolution: "NodeNext" /* Node.js 的模組解析策略 */,
    /* 輸出設定 */
    outDir: "build" /* 編譯輸出目錄 */,
    rootDir: "./src" /* 原始碼目錄 */,
    sourceMap: true /* 生成 source map 方便調試 */,
    declaration: true /* 生成 .d.ts 型別定義檔 */,
    declarationMap: true /* 生成 declaration source map */,
    /* 互通性約束 */
    esModuleInterop: true /* 啟用 ES 模組互通性 */,
    allowSyntheticDefaultImports: true /* 允許從沒有預設匯出的模組預設匯入 */,
    forceConsistentCasingInFileNames: true /* 強制檔案名稱大小寫一致 */,
    isolatedModules: true /* 確保每個檔案可以獨立編譯 */,
    /* 型別檢查 */
    strict: true /* 啟用所有嚴格的型別檢查選項 */,
    noUnusedLocals: true /* 檢查未使用的局部變數 */,
    noUnusedParameters: true /* 檢查未使用的參數 */,
    noImplicitReturns: true /* 檢查函式是否所有路徑都有回傳值 */,
    noFallthroughCasesInSwitch: true /* 檢查 switch 語句的 fall-through */,
    noUncheckedIndexedAccess: true /* 索引存取時包含 undefined 檢查 */,
    allowUnusedLabels: false /* 不允許未使用的標籤 */,
    allowUnreachableCode: false /* 不允許無法執行的程式碼 */,
    /* 其他 */
    skipLibCheck: true /* 跳過 .d.ts 檔案的型別檢查以加速編譯 */,
    resolveJsonModule: true /* 允許匯入 JSON 模組 */,
  },
  include: ["src/**/*"],
  exclude: ["node_modules", "build"],
};
