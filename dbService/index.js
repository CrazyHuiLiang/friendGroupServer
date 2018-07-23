var mysql      = require('mysql');
let config = require('../config');
let pool = mysql.createPool(config.mysql);


// 根据用户账号查询用户信息
function selectUserWithAccount(account, callback) {
  let selectSql = `SELECT * FROM user WHERE account='${account}';`
  pool.query(selectSql, callback)
}

// 添加用户
function insertUser (account, password, callback) {
  let insertSql = `INSERT INTO user (account, password, nickname, avatar, background, createdTime) VALUES ('${account}', '${password}', '', '', '', 0);`
  pool.query(insertSql, callback)
}

module.exports =  {
  selectUserWithAccount,
  insertUser
};