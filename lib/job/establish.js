var util = require('util');// 48596 157c29e48eb-cn-hangzhou-dg-a01
var EventEmitter = require('events');
var uuid = require('uuid');
var utils = require('../utils');
var Aliyun = require('../aliyun');

function Establish(id, options) {
  EventEmitter.call(this);
  this.options = options;
  this.id = id;
}

function pause(second, cb) {
  return new Promise(function(resolve, reject) {
    setTimeout(cb, second * 1000);
  });
}

Establish.establish = function(project, mock, honest) {
  var self = this;
  var ipList = [];
  var instanceId = '';
  var vServerGroupName = 'vsg-' + uuid.v1().split('-')[0] + '-' + project;
  var ruleName = 'r-' + uuid.v1().split('-')[0] + '-' + project;
  Aliyun.ecsCreateInstance()
  .then(function(instance) {
    return Aliyun.ecsDescribeInstances((JSON.parse(instance)).InstanceId);
  })
  .then(function(instance) {
    instanceId = (JSON.parse(instance)).Instances.Instance[0].InstanceId;
    ipList = (JSON.parse(instance)).Instances.Instance.map(function(ins) {
      return ins.VpcAttributes.PrivateIpAddress.IpAddress[0];
    });
    return instanceId;
  })
  .then(function(instanceId) {
    return Aliyun.ecsStartInstance(instanceId);
  })
  .then(function() {
    // CreateVServerGroup
    return Aliyun.slbCreateVServerGroup('157c29e48eb-cn-hangzhou-dg-a01', vServerGroupName, instanceId);
  })
  .then(function(vServerGroup) {
    vServerGroup = JSON.parse(vServerGroup);
    // CreateRules
    return Aliyun.slbCreateRules('157c29e48eb-cn-hangzhou-dg-a01', 80, ruleName, mock, vServerGroup.VServerGroupId);
  })
  .then(function() {
    // reconfig & reload nginx
    return pause(30, function() {
      return utils.run('/bin/ansible-playbook', ['-i', ipList.join(',') + ',', 'nginx-hackathon.yml', '-e', 'mock=' + mock, '-e', 'honest=' + honest], {
        cwd: '/data/www-data/ansible-roles',
        env: process.env
      });
    });
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

module.exports = Establish;
