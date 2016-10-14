module.exports = function (req, res, next) {
  // Assets do not out log.
  if (exports.ignore.test(req.url)) {
    next();
    return;
  }

  var t = new Date();

  res.on('finish', function () {
    var duration = ((new Date()) - t);
    console.log(t.toISOString() + ' ' + req.method + ' ' + req.url + ' ' + req.ip + ' ' + res.statusCode + ' (' + duration + 'ms)');
  });

  next();
};

exports.ignore = /^\/(public|agent)/;
