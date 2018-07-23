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


module.exports = router;
