import "../Toolkit/date.func.js";

/**
 * 測試日期轉換函數
 * Run: node --test build/tests/date.func.test.js
 */

describe("Date extension functions", () => {
  test("should convert Date to DateTime format", () => {
    const date = new Date("2025-01-27T11:01:39.123Z");
    const result = date.convertToDateTime();

    console.assert(
      result === "2025-01-27 11:01:39",
      `Expected '2025-01-27 11:01:39', got '${result}'`,
    );
  });

  test("should convert Date to Date only format", () => {
    const date = new Date("2025-01-27T11:01:39.123Z");
    const result = date.toDateOnlyString();

    console.assert(
      result === "2025-01-27",
      `Expected '2025-01-27', got '${result}'`,
    );
  });

  test("should convert Date to Time only format", () => {
    const date = new Date("2025-01-27T11:01:39.123Z");
    const result = date.toTimeOnlyString();

    console.assert(
      result === "11:01:39",
      `Expected '11:01:39', got '${result}'`,
    );
  });

  test("should handle different dates correctly", () => {
    const date = new Date("2020-12-31T23:59:59.999Z");
    const dateTime = date.convertToDateTime();
    const dateOnly = date.toDateOnlyString();
    const timeOnly = date.toTimeOnlyString();

    console.assert(
      dateTime === "2020-12-31 23:59:59",
      `DateTime format incorrect: ${dateTime}`,
    );
    console.assert(
      dateOnly === "2020-12-31",
      `Date only format incorrect: ${dateOnly}`,
    );
    console.assert(
      timeOnly === "23:59:59",
      `Time only format incorrect: ${timeOnly}`,
    );
  });
});

let testCounter = 0;

function describe(name: string, fn: () => void): void {
  console.log(`\n📋 Test Suite: ${name}`);
  fn();
}

function test(name: string, fn: () => void): void {
  testCounter++;
  try {
    fn();
    console.log(`✅ Test ${testCounter}: ${name}`);
  } catch (error) {
    console.error(`❌ Test ${testCounter}: ${name}`);
    console.error(error);
  }
}
