var mysql      = require('mysql');
let config = require('../config');
let pool = mysql.createPool(config.mysql);


// 根据用户账号查询用户信息
function selectUserWithAccount(account, callback) {
  let selectSql = `SELECT * FROM user WHERE account='${account}';`
  pool.query(selectSql, callback)
}
// 根据用户id查询用户信息
function selectUserWitId(id, callback) {
  let selectSql = `SELECT * FROM user WHERE id='${id}';`
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
  let selectSql = `UPDATE friendGroup.friend_request SET flag=${flag} WHERE friendId=${userId} AND userId=${friendId};`
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

/*
  设置用户头像
* */
function setUserAvatar (userId, url, callback) {
  let selectSql = `UPDATE user SET avatar='${url}' WHERE id='${userId}';`
  pool.query(selectSql, callback)
}

/*
  设置用户昵称
* */
function setNickName (userId, nickname, callback) {
  let selectSql = `UPDATE user SET nickname='${nickname}' WHERE id='${userId}';`
  pool.query(selectSql, callback)
}
/*
  发朋友圈
* */
function addNew (userId, content, images, callback) {
  let selectSql = `INSERT INTO news (userId, content, images, createdTime) VALUES (${userId}, '${content}', '${images}', 0);`
  pool.query(selectSql, callback)
}
/*
*  根据id获取朋友圈消息
* */
function newsWithId (id, callback) {
  let sql = `SELECT * from news WHERE id=${id};`
  pool.query(sql, callback)
}
/*
  获取朋友圈列表
* */
function listFriendsGroup (userId, pageIndex, pageSize, callback) {
  // let sql = `SELECT * FROM news WHERE userId IN (SELECT friendId from friend_relation WHERE userId=${userId} ) OR userId=${userId} ORDER BY id DESC limit ${pageIndex*pageSize},${pageSize};`
  let sql = `SELECT * FROM news WHERE userId IN (SELECT friendId from friend_relation WHERE userId=${userId} ) OR userId=${userId} ORDER BY id DESC;`
  console.log(sql)
  pool.query(sql, callback)
}

/*
  获取个人相册列表
* */
function listUserAlbum (userId, pageIndex, pageSize, callback) {
  let sql = `SELECT * FROM news WHERE userId=${userId};`
  pool.query(sql, callback)
}

/*
  查询是否已经点赞
* */
function selectPraise (userId, newsId, callback) {
  let sql = `SELECT * FROM praise WHERE userId=${userId} AND newId=${newsId};`
  pool.query(sql, callback)
}
/*
  点赞
* */
function addPraise (userId, newsId, callback) {
  let sql = `INSERT INTO praise (userId, newId, createdTime) VALUES (${userId}, ${newsId}, 0);`
  pool.query(sql, callback)
}
/*
  取消点赞
* */
function deletePraise (userId, newsId, callback) {
  let sql = `DELETE FROM praise WHERE userId=${userId} AND newId=${newsId};`
  pool.query(sql, callback)
}

/*
  查询某条朋友圈的点赞
* */
function selectPraiseForNews (newsId, callback) {
  let sql = `SELECT praise.id AS id, userId, newId, nickname, avatar, background FROM praise,user WHERE newId=${newsId} AND praise.userId=user.id;`
  pool.query(sql, callback)
}


/*
  点赞
* */
function addComment (userId, newsId, parentCommentId, comment, callback) {
  let sql = `INSERT INTO comment (newsId, userId, comment, parentCommentId, createdTime) VALUES (${newsId}, ${userId}, '${comment}', ${parentCommentId}, 0);`
  pool.query(sql, callback)
}

/*
  根据newsId获取comments
 */
function getCommentsWithNewsId (newsId, callback) {
  let sql = `SELECT * FROM comment WHERE newsId=${newsId};`
  pool.query(sql, callback)
}
/*
  根据commentId获取comment
 */
function getComment (commentId, callback) {
  let sql = `SELECT * FROM comment WHERE id=${commentId};`
  pool.query(sql, callback)
}

module.exports =  {
  selectUserWithAccount,
  selectUserWitId,
  insertUser,
  selectFriendsWithUserId,
  addFriendRequest,
  selectAddMyFriendRequest,
  updateAddFriendRequest,
  insertFriendRelation,
  removeFriend,
  setUserAvatar,
  setNickName,
  addNew,
  newsWithId,
  listFriendsGroup,
  listUserAlbum,
  selectPraise,
  addPraise,
  deletePraise,
  selectPraiseForNews,
  addComment,
  getComment,
  getCommentsWithNewsId
};