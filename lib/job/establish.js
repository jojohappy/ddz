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

util.inherits(Establish, EventEmitter);

function pause(second) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve();
    }, second * 1000);
  });
}

Establish.prototype.establish = function() {
  console.log(this.options);
  var self = this;
  var ipList = [];
  var instanceId = '';
  var project = this.options.project;
  var mock = this.options.mock;
  var honest = this.options.honest;
  var vServerGroupName = 'vsg-' + uuid.v1().split('-')[0] + '-' + project;
  var ruleName = 'r-' + uuid.v1().split('-')[0] + '-' + project;
  // Aliyun.ecsCreateInstance()
  // .then(function(instance) {
  //   instanceId = (JSON.parse(instance)).InstanceId;
  //   return pause(30);
  // })
  // .then(function() {
  //   return Aliyun.ecsStartInstance(instanceId);
  // })
  // .then(function() {
  //   return Aliyun.ecsDescribeInstances(instanceId);
  // })
  // .then(function(instance) {
  //   ipList = (JSON.parse(instance)).Instances.Instance.map(function(ins) {
  //     return ins.VpcAttributes.PrivateIpAddress.IpAddress[0];
  //   });
  //   return instanceId;
  // })
  // .then(function() {
  //   // CreateVServerGroup
  //   return Aliyun.slbCreateVServerGroup('157c29e48eb-cn-hangzhou-dg-a01', vServerGroupName, instanceId);
  // })
  // .then(function(vServerGroup) {
    // vServerGroup = JSON.parse(vServerGroup);
    // CreateRules
  Aliyun.slbCreateRules('157c29e48eb-cn-hangzhou-dg-a01', 80, ruleName, mock, 'rsp-c5b812b59t')
  .then(function() {
    // reconfig & reload nginx
    return utils.run('/usr/bin/ansible-playbook', ['-i', '10.32.10.21,', 'nginx-hackathon.yml', '-e', 'mock=' + mock, '-e', 'honest=' + honest], {
      cwd: '/data/www-data/ansible-roles',
      env: process.env
    });
  })
  .then(function() {
    self.emit('close', {
      id: self.id,
      status: 'finish',
      url: mock
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
