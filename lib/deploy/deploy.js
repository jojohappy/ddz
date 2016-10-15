var _ = require('lodash');
var shasum = require('shasum');
var util = require('util');
var fs = require('fs');
var YAML = require('yamljs');
var commands = require('./commands');
var ROLES_PATH = commands.ROLES_PATH;
var utils = require('../utils');

var Deploy = function(){};

Deploy._items = {
  'huputv.web.prd.main': [
    {
      repo: 'git@repo.hupu.io:HupuTv/huputv-server.git',
      yaml: '/data/www-data/yaml/huputv-server-ci.yml'
    },{
      repo: 'git@repo.hupu.io:HupuTv/huputv-frontend.git',
      yaml: '/data/www-data/yaml/huputv-frontend-ci.yml'
    }
  ],
  'huputv.deploy.prd.main': [
    {
      repo: 'git@repo.hupu.io:HupuTv/huputv-server.git',
      yaml: '/data/www-data/yaml/huputv-server-ci.yml'
    },{
      repo: 'git@repo.hupu.io:HupuTv/huputv-frontend.git',
      yaml: '/data/www-data/yaml/huputv-frontend-ci.yml'
    }
  ],
  'huputv.web.stg.main': [
    {
      repo: 'git@repo.hupu.io:HupuTv/huputv-server.git',
      yaml: '/data/www-data/yaml/huputv-server-ci.yml'
    },{
      repo: 'git@repo.hupu.io:HupuTv/huputv-frontend.git',
      yaml: '/data/www-data/yaml/huputv-frontend-ci.yml'
    }
  ],
  'HupuTv/huputv-frontend': {
    yaml: '/data/www-data/yaml/huputv-frontend-ci.yml'
  },
  'HupuTv/huputv-server': {
    yaml: '/data/www-data/yaml/huputv-server-ci.yml'
  },
  'HupuTv/huputv-soa': {
    yaml: '/data/www-data/yaml/huputv-soa-ci.yml'
  },
  'HupuTv/huputv-deploy': {
    yaml: '/data/www-data/yaml/huputv-frontend-ci.yml'
  }
};

Deploy.steps = ['install', 'before_build', 'build', 'deploy', 'after_deploy'];

Deploy.cloneDir = function() {
  return '/data/www-data/repository';
};

Deploy.getRepository = function(upstream) {
  return Deploy._items[upstream];
};

Deploy.deploy = function(repo, yaml, options) {
  var dir = Deploy.cloneDir();
  var src = dir + '/' + _.trimEnd(_.last(repo.split('/')), '.git');

  return Deploy.clone(repo, src, options)
  .then(function() {
    return Deploy.run(src, yaml, options);
  }).then(function() {
    return utils.run('rm', ['-rf', src], {
      env: process.env
    });
  });
};

Deploy.deployJob = function(limit, key) {
  var repositories = Deploy.getRepository(key);
  var promises = repositories.map(function(r) {
    return Deploy.deploy(r.repo, r.yaml, {
      env: 'prd',
      limit: limit
    });
  });
  return Promise.all(promises);
};

/*
options: {
  env: <env>,
  version: <version>,
  limit: <limit>
}
*/
Deploy.integrateJob = function(repo, key, options) {
  var item = Deploy.getRepository(key);
  if (!item) {
    return Promise.reject('project does not exists');
  }
  return Deploy.deploy(repo, item.yaml, options);
};

Deploy.clone = function(repo, dir, options) {
  var args = ['-i', '127.0.0.1,', 'git_clone.yml', '-c', 'local', '-e', 'repo=' + repo, '-e', 'dir=' + dir ];
  if (options.version) {
    args.push('-e');
    args.push('version=' + version);
  }
  return utils.run('/bin/ansible-playbook', args, {
    cwd: ROLES_PATH,
    env: process.env
  });
};

Deploy.build_scripts = function(obj, scripts, env, limit) {
  var content = '';
  if (!obj) {
    return null;
  }
  if (Array.isArray(obj)) {
    content = obj.reduce(function(content, o) {
      return content + '\n' + o;
    }, '');
  }
  else {
    content = Object.keys(obj).reduce(function(content, key) {
      if ('function' === typeof commands[key]) {
        return content + '\n' + commands[key](obj[key], env, limit);
      }
      return content + '';
    }, '');
  }
  fs.writeFileSync(scripts, content, {
    mode: 0766
  });
  return scripts;
};

Deploy.run = function(src, yaml, options) {
  var tasks = YAML.load(yaml);
  var sequence = Promise.resolve();
  Deploy.steps.forEach(function(step) {
    sequence = sequence.then(function() {
      if (tasks[step]) {
        var scripts = Deploy.build_scripts(tasks[step], src + '/' + step + '_script.sh', options);
        return utils.run('sh', [scripts], {
          cwd: src,
          env: process.env
        });
      }
    });
  });
  return sequence;
};

module.exports = Deploy;
