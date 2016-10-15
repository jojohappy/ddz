var WXBizMsgCrypt = require('wechat-crypto');

exports.callback = function (req, res) {
  var weixin = req.app.get('weixin');
  var cryptor = new WXBizMsgCrypt(weixin.token, weixin.encodingAESKey, weixin.corpId);
  var echostr = req.query.echostr;
  if (echostr) {
    var r = cryptor.decrypt(echostr);
    res.send(r.message);
  }
  else {
    res.sendStatus(200);
  }
};
