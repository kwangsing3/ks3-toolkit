# ks3-toolkit

Node.js 開發專案生成工具-具備基礎的資料庫、I/O、時間轉換、http method等包裝好的函示。無須安裝，需要開新專案時呼叫即可。

依照開發語言主體JS/TS各自引用不同的程式碼檔案。

NPM:
[ks3-toolkit (www.npmjs.com)](https://www.npmjs.com/package/ks3-toolkit)

Github Package:
[ks3-toolkit (Github Package)](https://github.com/kwangsing3/ks3-toolkit/pkgs/npm/ks3-toolkit)

# Usage

```bash
npx ks3-toolkit
```

```
package.json
|
|--- src --- index.ts (index.js)
|        |
|        |--- toolkit (copy from src/Toolkit)
|
|--- Readme.MD
|--- ...
|--- ...
```

![screenshot](docs/1.png)

# Develop

### 添加項目

- 新增更通用的項目，包裝成獨立函式後提交。

### 修改項目

- 較多為後續的重構或因版本變化的更新需求而修改。

##

```bash
git clone https://github.com/kwangsing3/ks3-toolkit

npm install
```

# Version

- 版本藉由帶tag的提交進行工作流發佈。
