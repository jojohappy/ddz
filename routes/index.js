var express = require('express');
var router = express.Router();
var WXBizMsgCrypt = require('wechat-crypto');

router.get('/hello', function(req, res, next) {
  res.send('hello world! ' + req.query.name);
});

router.get('/', function(req, res, next) {
  var weixin = req.app.get('weixin');
  var echostr = req.query.echostr;
  var cryptor = new WXBizMsgCrypt(weixin.token, weixin.encodingAESKey, weixin.corpId);
  var r = cryptor.decrypt(echostr);
  res.send(r.message);
});

module.exports = router;
