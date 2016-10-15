var util = require('util');

var ANSIBLE_PATH = '/bin/ansible-playbook';
var ROLES_PATH = '/data/www-data/ansible-roles/';
var VARIABLE_TPL = ' -e "%s=%s"';
/*
options: {
  env: <env>,
  version: <version>,
  limit: <limit>
}
*/
module.exports = {
  ansible: function(obj, options) {
    var env = options.env || 'prd';
    var realLimit = options.limit ? options.limit : obj.limit[env];
    var playbook = obj.playbook.reduce(function(playbook, p) {
      return util.format('%s%s%s ', playbook, ROLES_PATH, p);
    }, '');
    var commands = ANSIBLE_PATH + ' -l "' + realLimit + '" ' + playbook;
    if (obj.variables) {
      var variables = obj.variables;
      Object.keys(variables).forEach(function(key) {
        commands += util.format(VARIABLE_TPL, key, variables[key]);
      });
    }
    if (obj.tags) {
      var tags = obj.tags.reduce(function(tags, t) {
        return tags + '-t ' + t + ' ';
      }, '');
      commands += tags;
    }
    return commands;
  },
  shell: function(obj) {
    return obj.reduce(function(content, o) {
      return content + '\n' + o;
    }, '');
  },
  ROLES_PATH: ROLES_PATH
};