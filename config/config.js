require("dotenv").config();

let database = process.env.DB_NAME;
let username = process.env.DB_USER;
let password = process.env.DB_PASS;
let host = process.env.DB_HOST;
let port = process.env.DB_PORT;
let dialect = process.env.DB_DIALECT;
// let database = 'baladi-dev';
// let username = 'admin';
// let password = 'admin';
// let host = 'localhost';
// let dialect = 'postgresql';

const data = {
  development: {
    username: username,
    password: password,
    database: database,
    host: host,
    port: port,
    dialect: dialect
  },
  test: {
    username: username,
    password: password,
    database: database,
    host: host,
    dialect: dialect
  },
  production: {
    username: username,
    password: password,
    database: database,
    host: host,
    dialect: dialect
  }
}

module.exports = data;