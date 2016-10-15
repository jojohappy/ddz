var express = require('express');
var router = express.Router();
var WXBizMsgCrypt = require('wechat-crypto');

router.get('/hello', function(req, res) {
  res.send('hello world! ' + req.query.name);
});

router.get('/', function(req, res) {
  var wxConfig = req.app.get('wxConfig');
  var echostr = req.query.echostr;
  var cryptor = new WXBizMsgCrypt(wxConfig.token, wxConfig.encodingAESKey, wxConfig.corpId);
  var r = cryptor.decrypt(echostr);
  res.send(r.message);
});

router.post('/', function(req, res) {
  var msg = req.body;
  console.log(msg);
});

module.exports = router;
