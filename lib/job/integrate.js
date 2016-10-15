var util = require('util');
var EventEmitter = require('events');
var spawn = require('child_process').spawn;
var utils = require('../utils');
var Notification = require('../notification');
var Deploy = require('../deploy').Deploy;

function Integrate(id, options) {
  EventEmitter.call(this);
  this.options = options;
  this.id = id;
}

util.inherits(Integrate, EventEmitter);

Integrate.prototype.integrate = function() {
  var self = this;
  var i = this.options.homepage.indexOf('gitlab.hupu.com');
  this.options.project = this.options.homepage.substring(i + 'gitlab.hupu.com'.length + 1, this.options.homepage.length);
  return Deploy.integrateJob(this.options.repo, this.options.project, this.options)
  .then(function() {
    if (self.options.env === 'prd') {
      return Notification.sendmail(
        self.options.username,
        self.options.email,
        self.options.project,
        self.options.commits
      );
    }
  })
  .then(function() {
    self.emit('close', {
      id: self.id,
      status: 'finish'
    });
  })
  .catch(function(error) {
    return self.emit('close', {
      id: self.id,
      msg: error.toString(),
      status: 'failed'
    });
  });
};

module.exports = Integrate;
