import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "Olexandra",
  password: "Yt,tcyfz2003",
  database: "userdb"
});

export default pool;