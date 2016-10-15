var Capi = require('qcloudapi-sdk');
var config = require('../config').qcloud;

var Qcloud = {};

Qcloud.lexicalAnalysis = function(content, cb) {
  var capi = new Capi({
    SecretId: config.secretId,
    SecretKey: config.secretKey,
    serviceType: 'wenzhi'
  });

  capi.request({
    Region: 'gz',
    Action: 'LexicalAnalysis',
    code: 2097152,
    text: content,
    type: 0
  }, cb);
};

module.exports = Qcloud;
