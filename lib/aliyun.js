var utils = require('./utils');
var Aliyun = {};

/*
ImageId:'m-23n4uzykq',
InstanceType:'ecs.n1.medium',
SecurityGroupId:'sg-23pitnd0q',
InstanceChargeType:'PostPaid',
Period:1
profile:'default',
SystemDiskCategory:'cloud_efficiency',
VSwitchId:'vsw-bp1mnypnmrx3hj6b0l1cl',
Password:'r8ECGGFm1om9'
*/

Aliyun.createInstance = function() {
  var args = {
    ImageId:'m-23n4uzykq',
    InstanceType:'ecs.n1.medium',
    SecurityGroupId:'sg-23pitnd0q',
    InstanceChargeType:'PostPaid',
    Period:1,
    profile:'default',
    SystemDiskCategory:'cloud_efficiency',
    VSwitchId:'vsw-bp1mnypnmrx3hj6b0l1cl',
    Password:'r8ECGGFm1om9'
  };
  return utils.run('/usr/bin/aliyuncli', ['ecs', 'CreateInstance', '--output', 'json'].concat(utils.parseArgs(args)), {
    cwd: src,
    env: process.env
  });
};

module.exports = Aliyun;
