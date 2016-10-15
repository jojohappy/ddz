var corp = require('wechat-enterprise');

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
      res.sendStatus(200);
    })
    .voice(function(voice, req, res) {
      console.log('geting voice ...', voice);
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
