import * as mariadb from "mariadb";

let pool: mariadb.Pool;

/**
 * 連接至SQL資料庫
 * @param host
 * @param user
 * @param password
 * @param db
 */
export function ConnectToDB(
  host: string,
  user: string,
  password: string,
  db: string,
) {
  try {
    pool = mariadb.createPool({
      host: host,
      user: user,
      password: password,
      connectionLimit: 5,
      database: db,
      connectTimeout: 1000 * 10,
    });
  } catch (error) {
    console.log(`無法使用DBhandler服務:${error}`);
  }
}

/**
 * 向資料庫拉取語法要求的資料
 * @param query SQL命令
 * @returns 資料內容
 */
export async function GetContent(query: string) {
  const conn = await pool.getConnection();
  if (!conn) {
    throw new Error("DataBase 連接錯誤");
  }
  try {
    const data = await conn.query(query);
    return data;
  } finally {
    await conn.end();
  }
}

/**
 * 關閉與資料庫的連線
 * @function
 */
export async function CloseConnect() {
  await pool.end().catch((err: unknown) => {
    throw err;
  });
}

/**
 * 建立table表單，需要在input.name指定PRIMARY KEY (全大寫為主鍵)
 * @param struct 表單結構，包含name和type
 * @param database 資料庫名稱
 * @param tableName 表單名稱
 */
export async function CreateTable(
  struct: { name: string; type: string }[],
  database: string,
  tableName: string,
) {
  const columns = struct
    .map((col) => `\`${col.name}\` ${col.type}`)
    .join(",\n    ");

  const query = `
  CREATE TABLE IF NOT EXISTS \`${database}\`.\`${tableName}\` 
  (
    ${columns}
  ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;
  await GetContent(query);
}
/**
 * 依照傳入的內容[key,value]，轉換並覆寫到對應的DB表單。(主鍵判斷依表單為主)
 * 如果沒有則插入，依照主key為索引更新資料表
 * @param content 插入內容
 * @param database 資料庫名稱
 * @param tableName 表單名稱
 * @example
 * ```typescript
 * await Upsert(context, 'database', 'tablename');
 * ```
 */
export async function Upsert(
  content: JSON,
  database: string,
  tableName: string,
) {
  const keylist = Object.keys(content);
  const valuelist = Object.values(content);

  const values = valuelist
    .map((ele) =>
      typeof ele === "string"
        ? JSON.stringify(ele)
        : JSON.stringify(ele?.toString()),
    )
    .join(",\n      ");

  const columnNames = keylist.map((k) => `\`${k}\``).join(",\n    ");

  const updateClauses = keylist
    .map((key, index) => {
      const ele = valuelist[index];
      const val =
        typeof ele === "string"
          ? JSON.stringify(ele)
          : JSON.stringify(ele?.toString());
      return `\`${key}\`=${val}`;
    })
    .join(",\n      ");

  const query = `
  INSERT INTO \`${database}\`.\`${tableName}\` 
    (${columnNames})
    VALUES(
      ${values}
    ) ON DUPLICATE KEY UPDATE 
      ${updateClauses}
    ;`;
  await GetContent(query);
}

/**
 * 依照傳入的內容[key,value]，轉換並插入到對應的DB表單。
 * @param content 插入內容
 * @param database 資料庫名稱
 * @param tableName 表單名稱
 * @example
 * ```typescript
 * await Insert(context, 'database', 'tablename');
 * ```
 */
export async function Insert(
  content: JSON,
  database: string,
  tableName: string,
) {
  const keylist = Object.keys(content);
  const valuelist = Object.values(content);

  const columnNames = keylist.map((k) => `\`${k}\``).join(",\n    ");

  const values = valuelist
    .map((ele) =>
      typeof ele === "string"
        ? JSON.stringify(ele)
        : JSON.stringify(ele?.toString()),
    )
    .join(",\n      ");

  const query = `
  INSERT INTO \`${database}\`.\`${tableName}\`
    (${columnNames})
    VALUES(
      ${values}
    );`;
  await GetContent(query);
}
