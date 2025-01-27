import * as mariadb from 'mariadb';

/** @type {mariadb.Pool} */
let pool;

/**
 * 連接至SQL資料庫
 * @param {string} host
 * @param {string} user
 * @param {string} password
 * @param {string} db
 */
export function ConnectToDB(host, user, password, db) {
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
export async function GetContent(query) {
  const conn = await pool.getConnection();
  if (conn) {
    await conn.end();
  } else {
    throw new Error('DataBase 連接錯誤');
  }
  const data = await conn.query(query);
  return data;
}

/**
 * 關閉與資料庫的連線
 * @function
 */
export async function CloseConnect() {
  await pool.end().catch(err => {
    throw err;
  });
}

/**
 * 建立table表單，需要在input.name指定PRIMARY KEY (全大寫為主鍵)
 * @param {{name: string; type: string}[]} struct
 * @param {string} database
 * @param {string} tableName
 */
export async function CreateTable(struct, database, tableName) {
  let volume = '';
  for (let index = 0; index < struct.length; index++) {
    volume += ` ${struct[index].name} ${struct[index].type}${
      index === struct.length - 1 ? '' : ','
    }
    `;
  }
  const query = `
  CREATE TABLE IF NOT EXISTS ${database}.${tableName} 
  (
    ${volume}
  ) CHARACTER SET utf8 COLLATE utf8_general_ci;
  `;
  await GetContent(query);
}

/**
 * 依照傳入的內容[key,value]，轉換並覆寫到對應的DB表單。(主鍵判斷依表單為主)
 * @param {JSON} content 插入內容
 * @param {string} database 資料庫名稱
 * @param {string} tableName 表單名稱
 * @example
 * ```javascript
 * await Upsert(context, 'database', 'tablename');
 * ```
 */

/**
 * 如果沒有則插入，依照主key為索引更新資料表。  如果結構與表不同(無論增減)，則報錯。
 * @param content
 * @param database
 * @param tableName
 */
export async function Upsert(content, database, tableName) {
  const keylist = Object.keys(content);
  const valuelist = Object.values(content);
  let strkey = '';
  let value = '';
  for (let index = 0; index < valuelist.length; index++) {
    6;
    const ele = valuelist[index];
    value +=
      typeof ele === 'string'
        ? `${JSON.stringify(ele)}`
        : `${JSON.stringify(ele.toString())}`;
    strkey += keylist[index];
    if (index !== valuelist.length - 1) {
      value += ',\n';
      strkey += ',\n';
    }
  }
  let update = '';
  for (let index = 0; index < keylist.length; index++) {
    const ele = valuelist[index];
    const tt =
      typeof ele === 'string'
        ? `${JSON.stringify(ele)}`
        : `${JSON.stringify(ele.toString())}`;
    update += `${keylist[index]}` + '=' + tt;
    if (index !== keylist.length - 1) update += ',\n';
  }
  //
  const query = `
  INSERT INTO ${database}.${tableName} 
    (${strkey})
    VALUES(
      ${value}
    ) ON DUPLICATE KEY UPDATE 
      ${update}
    ;`;
  await GetContent(query);
}

/**
 * 依照傳入的內容[key,value]，轉換並插入到對應的DB表單。
 * @param {JSON} content 插入內容
 * @param {string} database 資料庫名稱
 * @param {string} tableName 表單名稱
 * @example
 * ```javascript
 * await Insert(context, 'database', 'tablename');
 * ```
 */
export async function Insert(content, database, tableName) {
  const keylist = Object.keys(content);
  let value = '';
  for (let index = 0; index < keylist.length; index++) {
    const ele = keylist[index];
    value += typeof ele === 'string' ? `"${ele}"` : `${ele}`;
    if (index !== keylist.length - 1) value += ',\n';
  }
  const query = `
  INSERT INTO ${database}.${tableName}
    VALUES(
      ${value}
    )
    ;`;
  await GetContent(query);
}
