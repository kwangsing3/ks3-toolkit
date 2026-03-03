import { mkdir, readdir, readFile, writeFile, rm } from "fs/promises";
import { join, dirname } from "path";
import type { Dirent } from "fs";

/**
 * 寫入檔案，並自動檢查是否有相應的資料夾位置
 * @async
 * @param targetPath 檔案位置
 * @param content 檔案內容
 * @throws 如果目錄創建或文件寫入失敗
 */
export async function WriteFile(
  targetPath: string,
  content: string,
): Promise<void> {
  const parentPath = dirname(targetPath);
  await MKDir(parentPath);
  const normalizedPath = join(targetPath);
  await writeFile(normalizedPath, content, "utf-8");
}

/**
 * 讀取檔案
 * @param targetPath 檔案位置
 * @returns 檔案內容字符串
 * @throws 如果文件讀取失敗
 */
export async function ReadFile(targetPath: string): Promise<string> {
  return await readFile(targetPath, "utf8");
}

/**
 * 建立資料夾，如果路徑不存在會依序建立路徑
 * @param tarPath 資料夾路徑
 * @throws 如果目錄創建失敗
 */
export async function MKDir(tarPath: string): Promise<void> {
  if (!tarPath) return;
  const normalizedPath = join(tarPath);
  await mkdir(normalizedPath, { recursive: true });
}

/**
 * 獲取路徑內所有檔案或資料夾的名稱
 * @param dirPath 目錄路徑
 * @param type "file" 或 "folder"
 * @param recursive 是否遞迴搜尋，預設為 false
 * @returns 檔案/資料夾名稱陣列
 */
export async function GetFilesOrFoldersName(
  dirPath: string,
  type: "file" | "folder",
  recursive?: boolean,
): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, {
      withFileTypes: true,
      recursive: recursive ?? false,
    });

    return entries
      .filter((dirent: Dirent) =>
        type === "file" ? dirent.isFile() : dirent.isDirectory(),
      )
      .map((dirent: Dirent) => dirent.name);
  } catch (err) {
    console.error("Error reading directory:", err);
    return [];
  }
}

/**
 * 刪除檔案或目錄
 * @param path 檔案或目錄位置
 * @throws 如果刪除操作失敗
 */
export async function DeleteFile(path: string): Promise<void> {
  try {
    await rm(path, { recursive: true, force: true });
  } catch (err) {
    console.error("Error deleting path:", err);
    throw err;
  }
}
