const mysql = require('mysql');
const util = require('util');
const database = (process.env.NODE_ENV === 'test') ? 'teacherdb_test' : 'teacherdb';
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database
});


// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }

  // console.log('dbConnection.js', process.env.NODE_ENV)
  // pool.query("CREATE DATABASE IF NOT EXISTS teacherdb", (err, result) => {
  //   if (err) throw err;
  //   console.log("Database created");
  // });

  if (connection) connection.release();

  return
});

pool.emptyTable = table => pool.query(`DELETE FROM ${table}`);
pool.selectTable = table => pool.query(`SELECT * FROM ${table}`);

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;