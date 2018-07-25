var express = require('express');
var router = express.Router();
let dbService = require('../dbService/index')
/* GET api listing. */
router.get('/', function(req, res, next) {
  res.send('微信朋友圈api');
});

/*
  注册
*/
router.post('/register', function(req, res, next) {
  let body = req.body
  dbService.selectUserWithAccount(body.account, (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      res.send({
        state: false,
        info: '账号已存在'
      });
    } else  {
      dbService.insertUser(body.account, body.password, (error, results, fields) => {
        if (error) throw error;
        res.send({
          state: true,
          info: '注册成功'
        });
      })
    }
  })
});
/*
  登录
*/
router.post('/login', function(req, res, next) {
  let body = req.body
  let account = body.account
  let password = body.password
  dbService.selectUserWithAccount(account, (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      let user = results[0]
      if (user.password === password) {
        res.send({
          state: true,
          info: user
        });
      } else {
        res.send({
          state: false,
          info: '密码错误'
        })
      }
    } else  {
      res.send({
        state: false,
        info: '用户不存在，请先注册'
      });
    }
  })
});


/*
  获取好友列表
*/
router.get('/getFriends', function(req, res, next) {
  let userId = req.query.userId
  dbService.selectFriendsWithUserId(userId, (error, results, fields) => {
    if (error) throw error;
    res.send({
      state: true,
      info: results
    });
  })
});


/*
  根据用户账号查找用户
*/
router.get('/searchUserWithAccount', function(req, res, next) {
  let account = req.query.account
  dbService.selectUserWithAccount(account, (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      res.send({
        state: true,
        info: results
      });
    } else  {
      res.send({
        state: false,
        info: '您所查找的用户不存在'
      });
    }
  })
});


/*
  通过用户id添加好友
*/
router.post('/addFriendWithUserId', function(req, res, next) {
  let userId = req.body.userId
  dbService.selectUserWithAccount(userId, (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      res.send({
        state: true,
        info: results
      });
    } else  {
      res.send({
        state: false,
        info: '您所查找的用户不存在'
      });
    }
  })
});
module.exports = router;
