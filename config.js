var _ = require('lodash');

var defaultConfig = {
  weixin: {
    token: 'xxx',
    encodingAESKey: 'xxx',
    corpId: 'xxx'
  }
};

var config = {
  development: function() {
    return _.merge(defaultConfig, {
    });
  },

  test: function() {
    return _.merge(defaultConfig,{
      database:{
        backend: 'memdown',
      }
    });
  },

  production: function() {
    return _.merge(defaultConfig, require('./config.production.js'));
  },
};

var env = process.env.NODE_ENV || 'development';

module.exports = config[env]();
