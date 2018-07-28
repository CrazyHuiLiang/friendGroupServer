const  path = require('path')

module.exports = {
  host: 'http://localhost:3000',
  mysql: {
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : '123456',
    database : 'friendGroup'
  },
  uploadFileUrl: path.resolve(__dirname, './files')
};
