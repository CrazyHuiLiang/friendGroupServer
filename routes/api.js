var express = require('express');
var router = express.Router();
let config = require('../config')
let path = require('path')
const fs = require('fs')
let dbService = require('../dbService/index')
var crypto = require('crypto');
// 计算md5值
function cryptPwd(password) {
  var md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex');
}
// 解码base64图片上传
function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

/* GET api listing. */
router.get('/', function(req, res, next) {
  res.send('微信朋友圈api');
});

/* 上传文件 */
router.post('/uploadFile',  function(req, res, next) {


  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let file = req.files.file;
  let url = `/${file.md5}${path.extname(file.name)}`

  // Use the mv() method to place the file somewhere on your server
  file.mv(config.uploadFileUrl + url, function(err) {
    if (err)
      return res.status(500).send(err);
    res.send({
      state: true,
      info: config.host + url
    })
  });
})


/* 上传文件 */
router.post('/uploadFileBase64',  function(req, res, next) {
  const file = req.body.file
  const filename = req.body.filename
  if (!file)
    return res.status(400).send('No files were uploaded.');

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  // let file = req.files.file;
  let md5 = cryptPwd(file)
  let url = `/${md5}${path.extname(filename)}`
  let fullPath = config.uploadFileUrl + url
  let imageBuffer = decodeBase64Image(file);

  fs.writeFile(fullPath, imageBuffer.data, {
    encoding: 'base64'
  }, (err) => {
    if (err) throw err;
    res.send({
      state: true,
      info: config.host + url
    })
  });
})
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
  let friendId = req.body.friendId
  dbService.addFriendRequest(userId, friendId, (error, results, fields) => {
    if (error) throw error;
    res.send({
      state: true,
      info: '申请已发出'
    });
  })
});

/*
  查看添加我的好友的申请
*/
router.get('/selectAddMyFriendRequest', function(req, res, next) {
  let userId = req.query.userId
  dbService.selectAddMyFriendRequest(userId, (error, results, fields) => {
    if (error) throw error;
    res.send({
      state: true,
      info: results
    });
  })
});

/*
  处理添加我的好友的申请，同意/拒绝
*/
router.post('/updateAddFriendRequest', function(req, res, next) {

  let userId = req.body.userId
  let friendId = req.body.friendId
  let flag = String(req.body.flag)
  dbService.updateAddFriendRequest(userId, friendId, flag, (error, results, fields) => {
    if (error) throw error;
    // 用户拒绝
    if (flag === '2') {
      res.send({
        state: true,
        info: '已拒绝好友'
      });
    } else if (flag === '1') { // 同意添加好友
      dbService.insertFriendRelation(userId, friendId, (error, results, fields) => {
        if (error) throw error;

        dbService.insertFriendRelation(friendId, userId, (error, results, fields) => {
          if (error) throw error;
          res.send({
            state: true,
            info: '添加好友成功'
          });
        })
      })
    }
  })
});

/*
  删除好友
*/
router.post('/removeFriend', function(req, res, next) {

  let userId = req.body.userId
  let friendId = req.body.friendId
  dbService.removeFriend(userId, friendId, (error, results, fields) => {
    if (error) throw error;
    dbService.removeFriend(friendId, userId, (error, results, fields) => {
      if (error) throw error;
      res.send({
        state: true,
        info: '删除好友成功'
      });
    })
  })
});

/*
  设置用户头像
*/
router.post('/setUserAvatar', function(req, res, next) {

  let userId = req.body.userId
  let url = req.body.url
  dbService.setUserAvatar(userId, url, (error, results, fields) => {
    if (error) throw error;
    res.send({
      state: true,
      info: '设置成功'
    });
  })
});

/*
  设置用户昵称
*/
router.post('/setNickname', function(req, res, next) {

  let userId = req.body.userId
  let nickname = req.body.nickname
  dbService.setNickName(userId, nickname, (error, results, fields) => {
    if (error) throw error;
    res.send({
      state: true,
      info: '设置成功'
    });
  })
});

/*
  发朋友圈
*/
router.post('/addNew', function(req, res, next) {

  let userId = req.body.userId
  let content = req.body.content
  let images = JSON.stringify(req.body.images)
  dbService.addNew(userId, content, images, (error, results, fields) => {
    if (error) throw error;
    dbService.newsWithId(results.insertId, (error, results, fields) => {
      if (error) throw error;
      let currentNews = results[0]
      currentNews.Praise = []
      currentNews.Comments = []

      selectUserWitId(userId, results => {
        currentNews.userInfo = results[0]
        res.send({
          state: true,
          info: currentNews
        });
      })
    })
  })
});

/*
  获取朋友圈列表
*/
router.get('/listFriendsGroup', function (req, res, next) {

  let userId = req.query.userId
  let pageIndex = req.query.pageIndex
  let pageSize = req.query.pageSize
  dbService.listFriendsGroup(userId, pageIndex, pageSize, (error, results, fields) => {
    if (error) throw error;
    // 朋友圈消息列表
    let news = results
    selectUserInfoForNews(news, 0, news => {
      selectPraiseForNews(news, 0, news => {
        selectCommentsForNews(news, 0, news => {
          res.send({
            state: true,
            info: news
          });
        })
      })
    })
  })
});


/*
  获取个人相册列表
*/
router.get('/listUserAlbum', function (req, res, next) {

  let userId = req.query.userId
  let pageIndex = req.query.pageIndex
  let pageSize = req.query.pageSize
  dbService.listUserAlbum(userId, pageIndex, pageSize, (error, results, fields) => {
    if (error) throw error;
    // 朋友圈消息列表
    let news = results
    selectUserInfoForNews(news, 0, news => {
      selectPraiseForNews(news, 0, news => {
        selectCommentsForNews(news, 0, news => {
          res.send({
            state: true,
            info: news
          });
        })
      })
    })
  })
});


/*
  点赞/取消点赞
*/
router.post('/praiseNew', function (req, res, next) {

  let userId = req.body.userId
  let newId = req.body.newId
  dbService.selectPraise(userId, newId, (error, results, fields) => {
    if (error) throw error;
    if (results.length > 0) {
      dbService.deletePraise(userId, newId, (error, results, fields) => {
        res.send({
          state: true,
          info: '取消点赞成功'
        });
      })
    } else {
      dbService.addPraise(userId, newId, (error, results, fields) => {
        res.send({
          state: true,
          info: '点赞成功'
        });
      })
    }
  })
});

/*
  评论
*/
router.post('/addComment', function (req, res, next) {

  let userId = req.body.userId
  let newsId = req.body.newsId
  let parentCommentId = req.body.parentCommentId
  let comment = req.body.comment


  dbService.addComment(userId, newsId, parentCommentId, comment, (error, results, fields) => {
    if (error) throw error;
    let commentId = results.insertId

    getCommentWith(commentId).then(comment=> {
      res.send({
        state: true,
        info: comment
      });
    })
  })
});




// 根据userId 获取用户信息
function selectUserWitId (userId, callback) {
  dbService.selectUserWitId(userId, (error, results, fields) => {
    if (error) throw error;
    callback(results)
  })
}

// 为朋友圈列表获取每条消息的用户信息
function selectUserInfoForNews (news, cursor, callback) {
  let currentNews = news[cursor]
  selectUserWitId(currentNews.userId, results => {
    if (results.length > 0) {
      currentNews.userInfo = results[0]
    }

    if (cursor === news.length-1) {
      callback(news)
    } else {
      selectUserInfoForNews(news, cursor+1, callback)
    }
  })
}

// 为朋友圈列表获取每条消息的点赞信息
function selectPraiseForNews (news, cursor, callback) {
  let currentNews = news[cursor]
  dbService.selectPraiseForNews(currentNews.id, (error, results, fields) => {
    if (error) throw error;

    currentNews.praises = results

    if (cursor === news.length-1) {
      callback(news)
    } else {
      selectPraiseForNews(news, cursor+1, callback)
    }
  })
}

// 通过评论id获取info
function getCommentWith (commentId) {
  return new Promise(resolve => {

    dbService.getComment(commentId, (error, results, fields) => {
      if (error) throw error;
      let comment = results[0]

      dbService.selectUserWitId(comment.userId, (error, results, fields) => {
        comment.userA = results[0]

        if (comment.parentCommentId && comment.parentCommentId !==0) {

          dbService.getComment(comment.parentCommentId, (error, results, fields) => {
            if (error) throw error;
            let parentComment = results[0]

            dbService.selectUserWitId(parentComment.userId, (error, results, fields) => {
              comment.userB = results[0]
              resolve(comment)
            })
          })

        } else {
          resolve(comment)
        }
      })
    })
  })
}

// 为朋友圈列表获取每条消息的评论信息
function selectComments (comments, cursor, callback) {
  if (comments.length === 0) {
    callback(comments)
    return
  }

  let currentComments = comments[cursor]
  getCommentWith(currentComments.id).then(results => {
    comments[cursor] = results

    if (cursor === comments.length-1) {
      callback(comments)
    } else {
      selectComments(comments, cursor+1, callback)
    }
  })
}

// 为朋友圈列表获取每条消息的评论信息
function selectCommentsForNews (news, cursor, callback) {
  let currentNews = news[cursor]
  dbService.getCommentsWithNewsId(currentNews.id, (error, results, fields) => {
    if (error) throw error;

    selectComments(results, 0, comments => {
      currentNews.comments = comments
      if (cursor === news.length-1) {
        callback(news)
      } else {
        selectCommentsForNews(news, cursor+1, callback)
      }
    })
  })
}

module.exports = router;
