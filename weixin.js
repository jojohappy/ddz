var corp = require('wechat-enterprise');

module.exports = function(config) {
  var wx = corp(config);

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
      console.log('geting event ...', event);
      res.sendStatus(200);
    })
    .middlewarify()
};
