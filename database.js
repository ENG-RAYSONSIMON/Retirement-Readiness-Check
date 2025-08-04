import mysql from 'mysql2/promise';
import SystemParams from './SystemParams.js';

const pool = mysql.createPool({
  host: SystemParams.MYSQL_DB_HOST,
  user: SystemParams.MYSQL_DB_USER,
  database: SystemParams.MYSQL_DB_NAME,  
  password: SystemParams.MYSQL_DB_PASSWORD,
  waitForConnections: true,               
  connectionLimit: 10,                    
  queueLimit: 0                          
});

const database = {
  execute: function (query, paramsArray, retries = 10) {
    return new Promise(async (resolve, reject) => {
      let attempt = 0;

      while (attempt < retries) {
        const connection = await pool.getConnection();

        try {
          const result = await connection.execute(query, paramsArray);
          connection.release();
          return resolve(result);
        } catch (error) {
          connection.release();

          if (error.code === 'ER_LOCK_DEADLOCK') {
            attempt++;
            console.warn(`Deadlock detected on attempt ${attempt}/${retries}. Retrying query: ${query} with params ${paramsArray}`);
            await new Promise(res => setTimeout(res, 100 * attempt)); // exponential backoff
            continue;
          }

          console.log(`Database error for query ${query} and params ${paramsArray}`, error);
          return reject(error);
        }
      }

      return reject(new Error(`Failed after ${retries} attempts due to repeated deadlocks`));
    });
  }
};

export default database;
