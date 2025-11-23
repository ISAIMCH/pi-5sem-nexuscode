const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'NexusCode_2',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableKeepAlive: true,
  },
};

let pool;

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('Database Connection Failed! Bad config: ', err);
    process.exit(1);
  });

// Función para obtener conexión desde el pool
const getConnection = async () => {
  return await poolPromise;
};

module.exports = {
  sql,
  poolPromise,
  getConnection,
};
