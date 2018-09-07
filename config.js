const  path = require('path')

module.exports = {
  host: 'http://localhost:3000',
  mysql: {
    connectionLimit : 100,
    host     : 'localhost',
    user     : 'root',
    password : '12345678',
    database : 'friendGroup',
    insecureAuth : true
  },
  uploadFileUrl: path.resolve(__dirname, './files')
};
