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

// 查找我的好友列表
function selectFriendsWithUserId(userId, callback) {
  let selectSql = `SELECT * FROM user WHERE id IN (SELECT (friendId) FROM friend_relation WHERE userId=${userId});`
  pool.query(selectSql, callback)
}
// 添加用户申请
function addFriendRequest (myUserId, friendUserId, callback) {
  let selectSql = `INSERT INTO friend_request (userId, friendId, flag, createdTime) VALUES (${myUserId}, ${friendUserId}, 0, 0);`
  pool.query(selectSql, callback)
}


/*
  查看添加我好友的申请
*/
function selectAddMyFriendRequest (myUserId, callback) {
  let selectSql = `SELECT request.id, userId, account, nickname, avatar, background, flag FROM user,(SELECT id, userId, flag FROM friendGroup.friend_request WHERE friendId=${myUserId}) AS request WHERE request.userId=user.id;`
  pool.query(selectSql, callback)
}

/*
  处理添加好友的申请
* */
function updateAddFriendRequest (userId, friendId, flag, callback) {
  let selectSql = `UPDATE friendGroup.friend_request SET flag=${flag} WHERE userId=${userId} AND friendId=${friendId};`
  pool.query(selectSql, callback)
}

/*
  添加好友关系
* */
function insertFriendRelation (userId, friendId, callback) {
  let selectSql = `INSERT INTO friend_relation (userId, friendId, flag, createdTime) VALUES (${userId}, ${friendId}, 0, 0);`
  pool.query(selectSql, callback)
}

/*
  删除好友关系
* */
function removeFriend (userId, friendId, callback) {
  let selectSql = `DELETE FROM friend_relation WHERE userId=${userId} AND friendId=${friendId};`
  pool.query(selectSql, callback)
}


module.exports =  {
  selectUserWithAccount,
  insertUser,
  selectFriendsWithUserId,
  addFriendRequest,
  selectAddMyFriendRequest,
  updateAddFriendRequest,
  insertFriendRelation,
  removeFriend
};