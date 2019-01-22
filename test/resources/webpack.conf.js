const path = require('path');
const rootDir = `../..`;
const resolve = (dir) => path.join(__dirname, rootDir, dir);

module.exports = {
  resolve: {
    alias: {
      'aliasModuleE$': resolve('test/resources/module-e.js'),
      'aliasModuleF$': resolve('test/resources/module-f.vue')
    }
  }
}