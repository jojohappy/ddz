var _ = require('lodash');
var fs = require('fs');
var utils = require('../utils');

function Connection(host) {
  this.host = host;
}

// /usr/bin/rsync --delay-updates -F --compress --archive --delete-after --rsh 'ssh -S none -o StrictHostKeyChecking=no' --out-format='<<CHANGED>>%i %n%L' /tmp/project root@192.168.23.35:/data/www-data/hupu.com/project

Connection.prototype.sync = function(src, dest) {
  var self = this;
  var ts = _.clone(src);
  return utils.run('/usr/bin/rsync', ['--delay-updates', '-F', '--compress', '--archive', '--delete-after', '--rsh', 'ssh -S none -o StrictHostKeyChecking=no', src, 'root@' + self.host + ':' + dest], {
    env: process.env
  });
};

Connection.prototype.exec = function(cmd) {
  return utils.run('ssh', [this.host, cmd]);
};

module.exports = Connection;
