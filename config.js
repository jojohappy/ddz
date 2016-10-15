var _ = require('lodash');

var defaultConfig = {
  weixin: {
    agentId: 0,
    token: 'xxx',
    encodingAESKey: 'xxx',
    corpSecret: 'xxx',
    corpId: 'xxx'
  },
  'baidu': {
    apiKey: "xxx",
    secretKey: "xxx",
  }
};

var config = {
  development: function() {
    return _.merge(defaultConfig, {
    });
  },

  test: function() {
    return _.merge(defaultConfig,{});
  },

  production: function() {
    return _.merge(defaultConfig, require('./config.production.js'));
  },
};

var env = process.env.NODE_ENV || 'development';

module.exports = config[env]();
