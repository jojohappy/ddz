var util = require('util');
var moment = require('moment');
var nodemailer = require('nodemailer');
var smtpConfig = require('../config').smtp;

var Notification = function() {};

Notification.MAIL_BODY_TPL = '<style type="text/css">.div-commits {border: 1px solid #999;}.div-commits div:last-child {border-bottom: none;}.div-commits-item {border-bottom: 1px solid #999;padding: 10px;background: #f5f5f5;}.div-title {color: #333333;font-size: 15px;font-weight: bold;}.div-info {margin-top: 10px;color: #999;font-size: 13px;}</style><p>Deploy commits: </p><div class="div-commits">%s</div>';
Notification.COMMIT_ITEM_TPL = '<div class="div-commits-item"><div class="div-title">%s</div><div class="div-info">%s(%s) %s commit: <a href="%s">%s</a></div></div>';
Notification.MAIL_SUBJECT_TPL = '生产环境自动发布: %s';

Notification.sendmail = function(username, email, project, commits) {
  console.log(util.format('username=%s,email=%s,project=%s',username, email, project));
  var transporter = nodemailer.createTransport(smtpConfig);
  var html = Notification.build(commits);
  return new Promise(function(resolve, reject) {
    transporter.sendMail({
      from: smtpConfig.auth.user,
      to: '"' + username + '" <' + email + '>',
      cc: smtpConfig.cc,
      subject: util.format(Notification.MAIL_SUBJECT_TPL, project),
      html: html
    }, function(err) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve();
    });
  });
};

Notification.build = function(commits) {
  var body = '';
  for (var i = 0; i < commits.length - 1; i++) {
    var commit = commits[i];
    body += util.format(Notification.COMMIT_ITEM_TPL, commit.message, commit.author.name, commit.author.email, moment(commit.timestamp).format('YYYY-MM-DD HH:mm:ss'), commit.url, commit.id);
  }
  return util.format(Notification.MAIL_BODY_TPL, body);
};

module.exports = Notification;
