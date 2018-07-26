var express = require('express');
var router = express.Router();
let config = require('../config')
let path = require('path')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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
      info: url
    })
  });
})

module.exports = router;
