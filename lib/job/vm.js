var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events');
var spawn = require('child_process').spawn;
var utils = require('../utils');
var Deploy = require('../deploy').Deploy;

function Vm(id, options) {
  EventEmitter.call(this);
  this.options = options;
  this.id = id;
}

util.inherits(Vm, EventEmitter);

Vm.prototype.createVm = function() {
  var self = this;
  var vms = null;
  console.log('create vm, options: ' + JSON.stringify(this.options));
  var ansible = spawn('python', ['auto_kvm.py', '-p', this.options.project, '-f', this.options.fn, '-e', this.options.env, '-k', this.options.ips], {
    cwd: '/root/ansible-roles',
    env: process.env
  });
  var grep = spawn('grep', ['unreachable']);
  ansible.stdout.on('data', function(data) {
    console.log('stdout: ' + data.toString());
    grep.stdin.write(data);
  });
  ansible.on('close', function() {
    grep.stdin.end();
  });
  grep.stdout.on('data', function(data) {
    vms = Object.keys(JSON.parse(data.toString().split('\n')[1]));
  });
  grep.on('close', function() {
    self.emit('close', {
      id: self.id,
      msg: vms.join(','),
      status: 'finish'
    });
  });
};

Vm.prototype.createVmWithUpstream = function() {
  var self = this;
  var vms;
  console.log('create vm with upstream, options: ' + JSON.stringify(this.options));
  new Promise(function(resolve, reject) {
    self.emit('process', {
      id: self.id,
      status: 'create vm'
    });
    var ansible = spawn('python', ['auto_kvm.py', '-p', self.options.project, '-f', self.options.fn, '-e', self.options.env, '-k', self.options.ips], {
      cwd: '/root/ansible-roles',
      env: process.env
    });
    var grep = spawn('grep', ['unreachable']);
    ansible.stdout.on('data', function(data) {
      console.log('stdout: ' + data.toString());
      grep.stdin.write(data);
    });
    ansible.on('close', function() {
      grep.stdin.end();
    });
    grep.stdout.on('data', function(data) {
      vms = Object.keys(JSON.parse(data.toString().split('\n')[1]));
      vms = vms.join(',');
    });
    grep.on('close', function() {
      resolve();
    });
  }).then(function() {
    self.emit('process', {
      id: self.id,
      status: 'pre-install'
    });
    return utils.run('/bin/ansible-playbook', ['-l', vms, '-t', 'install', 'nginx.yml', 'php.yml'], {
      cwd: '/root/ansible-roles',
      env: process.env
    });
  }).then(function() {
    self.emit('process', {
      id: self.id,
      status: 'deploy'
    });
    // deploy code
    // var connection = new DeployModule.Connection(host);
    return Deploy.deployJob(vms, self.options.upstream);
  }).then(function() {
    self.emit('process', {
      id: self.id,
      status: 'push into production'
    });
    // add upstream skydns/up/huputv/web/prd/main
    var fn = _.last(self.options.upstream.split('.'));
    return utils.run('/bin/ansible-playbook', ['-l', vms, 'skydns.yml', '-e', 'action=add function=' + fn], {
      cwd: '/root/ansible-roles',
      env: process.env
    });
  }).then(function() {
    self.emit('close', {
      id: self.id,
      msg: vms,
      status: 'finish'
    });
  }).catch(function(error) {
    console.log(error);
    self.emit('process', {
      id: self.id,
      msg: error.toString(),
      status: 'failed'
    });
  });
};

module.exports = Vm;
