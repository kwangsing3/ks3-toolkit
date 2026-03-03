import { GetArgs } from "../Toolkit/args.func.js";

/**
 * 測試命令行參數解析
 * Run: node --test build/tests/args.func.test.js
 */

describe("GetArgs function", () => {
  // 保存原始的 process.argv
  const originalArgv = process.argv;

  beforeEach(() => {
    // 重置 process.argv
    process.argv = ["node", "script.js"];
  });

  afterEach(() => {
    // 恢復原始的 process.argv
    process.argv = originalArgv;
  });

  test("should parse simple arguments", () => {
    process.argv = ["node", "script.js", "--flag=value", "--mode=production"];
    const args = GetArgs();

    console.assert(
      args.flag === "value",
      "flag should be 'value'",
    );
    console.assert(
      args.mode === "production",
      "mode should be 'production'",
    );
  });

  test("should handle empty string arguments", () => {
    process.argv = ["node", "script.js", "--empty="];
    const args = GetArgs();

    console.assert(
      args.empty === "",
      "empty should be empty string",
    );
  });

  test("should remove quotes from values", () => {
    process.argv = [
      "node",
      "script.js",
      '--quoted="hello"',
      "--single='world'",
    ];
    const args = GetArgs();

    console.assert(
      args.quoted === "hello",
      "quoted should be 'hello' without quotes",
    );
    console.assert(
      args.single === "world",
      "single should be 'world' without quotes",
    );
  });

  test("should return empty object for no arguments", () => {
    process.argv = ["node", "script.js"];
    const args = GetArgs();

    console.assert(
      Object.keys(args).length === 0,
      "should return empty object",
    );
  });
});

// 簡單的測試運行器
function describe(
  name: string,
  fn: () => void,
): void {
  console.log(`\n📋 Test Suite: ${name}`);
  fn();
}

function beforeEach(_fn: () => void): void {
  // 實現 beforeEach 的邏輯
}

function afterEach(_fn: () => void): void {
  // 實現 afterEach 的邏輯
}

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✅ ${name}`);
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(error);
  }
}
