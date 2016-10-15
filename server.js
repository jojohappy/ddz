var express = require('express');
var fs = require('fs')
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var util = require('util')

var config = require('./config').weixin;
var weixin = require('./weixin');

var app = express();
module.exports = app; // for testing

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// set config
app.set('weixin', config);

var logOptions = {};
logger.token('body', function(req, res){ return util.inspect(req.body, {depth:null}); })
app.use(logger(':method :url :status :response-time ms :res[content-length] bytes with :body', logOptions));
app.use(bodyParser.json());
app.use(bodyParser.text({type: "*/xml"}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/weixin/callback', weixin.callback);
app.get('/weixin/hello', function(req, res, next) {
  res.send('hello world! ' + req.query.name);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (app.get('env') === 'development') {
    console.trace(err);
  }
  res.send(err.message);
});


var hostname = process.env.HOST || '127.0.0.1';
var port = process.env.PORT || 3521;
app.listen(port, hostname, function() {
  console.log('try this:\ncurl http://' + hostname + ':' + port + '/hello?name=Scott');
});

