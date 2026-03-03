import { WriteFile, MKDir, ReadFile } from "../Toolkit/fileIO.mod.js";
import { join } from "path";
import { rm } from "fs/promises";

/**
 * 測試文件 I/O 操作
 * Run: node --test build/tests/fileIO.mod.test.js
 */

const testDir = join(process.cwd(), ".test-temp");

before(async () => {
  console.log("🔧 Setting up test environment...");
  await MKDir(testDir);
});

after(async () => {
  console.log("🧹 Cleaning up test environment...");
  await rm(testDir, { recursive: true, force: true });
});

describe("FileIO Functions", () => {
  test("should write and read file", async () => {
    const testFile = join(testDir, "test.txt");
    const content = "Hello, World!";

    // 寫入文件
    await WriteFile(testFile, content);

    // 讀取文件
    const readContent = await ReadFile(testFile);

    console.assert(
      readContent === content,
      `Expected '${content}', got '${readContent}'`,
    );
  });

  test("should create nested directories", async () => {
    const nestedPath = join(testDir, "a", "b", "c");
    await MKDir(nestedPath);

    const testFile = join(nestedPath, "nested.txt");
    await WriteFile(testFile, "nested content");

    const content = await ReadFile(testFile);
    console.assert(content === "nested content", "Nested file creation failed");
  });

  test("should handle json files", async () => {
    const jsonFile = join(testDir, "data.json");
    const jsonData = { name: "test", value: 42 };

    await WriteFile(jsonFile, JSON.stringify(jsonData, null, 2));
    const readContent = await ReadFile(jsonFile);
    const parsedData = JSON.parse(readContent);

    console.assert(parsedData.name === "test", "JSON name mismatch");
    console.assert(parsedData.value === 42, "JSON value mismatch");
  });
});

let testCounter = 0;

function describe(name: string, fn: () => void): void {
  console.log(`\n📋 Test Suite: ${name}`);
  fn();
}

function before(_fn: () => Promise<void>): void {
  // Setup
}

function after(_fn: () => Promise<void>): void {
  // Teardown
}

function test(name: string, fn: () => Promise<void>): void {
  testCounter++;
  fn()
    .then(() => {
      console.log(`✅ Test ${testCounter}: ${name}`);
    })
    .catch((error) => {
      console.error(`❌ Test ${testCounter}: ${name}`);
      console.error(error);
    });
}
