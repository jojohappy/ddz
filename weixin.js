var request = require('request');
var corp = require('wechat-enterprise');
var uuid = require('uuid');
var baidu = require('./config').baidu;
var weixin = require('./config').weixin;
var Analysis = require('./lib/analysis');
var Jobs = require('./lib/jobs');

var AUTH_URL = "https://openapi.baidu.com/oauth/2.0/token";
var VOP_URL = "http://vop.baidu.com/server_api";

function baiduResponder(done) {
  return function(err, resp, data) {
    if (err) {
      done(err);
    }
    else {
      var body = JSON.parse(data);
      if (body['err_no'] && body['err_no'] != 0) {
        console.log('error with:', body);
        done(body['err_msg']);
      } else {
        done(null, body);
      }
    }
  }
}

function auth(done) {
  var url = AUTH_URL
  + "?grant_type=client_credentials"
  + "&client_id=" + baidu.apiKey
  + "&client_secret=" + baidu.secretKey;
  request({
      url: url,
      method: 'POST',
    },
    baiduResponder(function(err, body) {
      if (err) {
        done(err);
      }
      else {
        done(null, body['access_token']);
      }
    })
  );
}

function recognize(data, format, done) {
  auth(function(err, token) {
    if (err) {
      return done(err);
    }

    var b64Data = data.toString('base64');
    var jsonData = JSON.stringify({
      "format": format,
      "rate": 8000,
      "channel": 1,
      "token": token,
      "cuid": weixin.corpId,
      "len": data.length,
      "speech": b64Data,
    });

    request({
        url: VOP_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': jsonData.length,
        },
        body: jsonData,
      },
      baiduResponder(done)
    );
  });
}

function sendMsg(corpApi, text, fromUserName) {
  corpApi.send({
    "touser": fromUserName
  }, {
   "msgtype": "text",
   "text": {
     "content": text
   },
   "safe":"0"
  }, function(err, data) {
    console.log('resp with', data);
    if (err) {
      console.error(err);
    }
  });
}

function analysis(corpApi, text, fromUserName) {
  Analysis.analysis(text, function(err, site) {
    var msg = text;
    if (err || !site) {
      return sendMsg(corpApi, err, fromUserName);
    }
    else {
      sendMsg(corpApi, msg, fromUserName);
      var job = Jobs.add({
        type: 'establish',
        operation: 'establish',
        options: {
          project: site.project,
          honest: site.url,
          mock: uuid.v1().split('-')[0] + '.i16.tv'
        },
        id: -99
      });

      job.on('close', function(data) {
        if (data.status === 'failed') {
          return sendMsg(corpApi, '失败' + msg, fromUserName);
        }
        else {
          return sendMsg(corpApi, '开设成功! 访问地址:' + data.url, fromUserName);
        }
      });
    }
  });
}

module.exports = function(config) {
  var wx = corp(config);
  var corpApi = new corp.API(
    config.corpId,
    config.corpSecret,
    config.agentId
  );

  return wx
    .text(function(text, req, res) {
      console.log('geting text ...', text);
      analysis(corpApi, text['Content'], text['FromUserName']);
      res.sendStatus(200);
    })
    .voice(function(voice, req, res) {
      corpApi.getMedia(
        voice['MediaId'],
        function(err, data) {
        if (err) {
          console.log('Error get media', err);
        }
        else {
          recognize(data, voice['Format'], function(err, body) {
            if (err) {
            }
            else {
              console.log('Voice recognization:', body);
              analysis(corpApi, body.result[0], voice['FromUserName']);
            }
          })
        }
      })
      res.sendStatus(200);
    })
    .event(function (event, req, res) {
      console.log('geting event ...', typeof event, event.Event);
      if (event['Event'] == 'enter_agent') {
        console.log(event.FromUserName, 'is entering');
      }

      res.sendStatus(200);
    })
    .middlewarify()
};
