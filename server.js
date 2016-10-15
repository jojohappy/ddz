var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var responseTime = require('response-time');
var responseLog = require('./middleware/request_log');
var wxConfig = require('./config').weixin;

var routes = require('./routes/index');

var app = express();
module.exports = app; // for testing

app.use(responseLog);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(responseTime());

app.use('/dj-test', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// set weixin configure
app.set('wxConfig', wxConfig);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var hostname = process.env.HOST || '127.0.0.1';
var port = process.env.PORT || 3521;
app.listen(port, hostname, function() {
  console.log('try this:\ncurl http://' + hostname + ':' + port + '/hello?name=Scott');
});

