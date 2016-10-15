var utils = require('./utils');
var Aliyun = {};
// 157c29e48eb-cn-hangzhou-dg-a01
Aliyun.ecsCreateInstance = function() {
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
    env: process.env
  });
};

Aliyun.ecsDescribeInstances = function(instanceId) {
  var args = {
    InstanceIds: '["' + instanceId + '"]',
    profile:'default'
  };
  return utils.run('/usr/bin/aliyuncli', ['ecs', 'DescribeInstances', '--output', 'json'].concat(utils.parseArgs(args)), {
    env: process.env
  });
};

Aliyun.ecsStartInstance = function(instanceId) {
  var args = {
    InstanceIds: instanceId,
    profile:'default'
  };
  return utils.run('/usr/bin/aliyuncli', ['ecs', 'StartInstance', '--output', 'json'].concat(utils.parseArgs(args)), {
    env: process.env
  });
};

Aliyun.slbCreateVServerGroup = function(loadBalancerId, vServerGroupName, instanceId) {
  var args = {
    LoadBalancerId: loadBalancerId,
    VServerGroupName: vServerGroupName,
    profile:'default',
    BackendServers: JSON.stringify([
    {
      ServerId: instanceId,
      Port: 48596
    }
    ])
  };
  return utils.run('/usr/bin/aliyuncli', ['slb', 'CreateVServerGroup', '--output', 'json'].concat(utils.parseArgs(args)), {
    env: process.env
  });
};

Aliyun.slbCreateRules = function(loadBalancerId, listenerPort, ruleName, domain, vServerGroupId) {
  var args = {
    LoadBalancerId: loadBalancerId,
    ListenerPort: listenerPort,
    profile:'default',
    RuleList: JSON.stringify([
    {
      RuleName: ruleName,
      Domain: domain,
      VServerGroupId: vServerGroupId
    }
    ])
  };
  return utils.run('/usr/bin/aliyuncli', ['slb', 'CreateRules', '--output', 'json'].concat(utils.parseArgs(args)), {
    env: process.env
  });
};

module.exports = Aliyun;
