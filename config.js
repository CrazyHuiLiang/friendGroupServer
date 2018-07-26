const  path = require('path')

module.exports = {
  mysql: {
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'friendGroup'
  },
  uploadFileUrl: path.resolve(__dirname, './files')
};
