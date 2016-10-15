var spawn = require('child_process').spawn;
var crypto = require('crypto');

module.exports = {
  run: function(cmd, args, options) {
    var output = '';
    return new Promise(function(resolve, reject) {
      var child = spawn(cmd, args, options);
      child.stdout.on('data', function(data) {
        console.log('stdout: ' + data.toString());
        output += data.toString();
      });
      child.stderr.on('data', function(data) {
        console.log('stderr: ' + data.toString());
      });
      child.on('error', function(error) {
        console.log('error: ' + error);
        return reject(error);
      });
      child.on('close', function() {
        return resolve(output);
      });
    });
  },
  parseArgs: function(args) {
    var arrArgs = Object.keys(args).reduce(function(arrArgs, key) {
      return arrArgs.concat(['--' + key, args[key]]);
    }, []);
    return arrArgs;
  }
};
