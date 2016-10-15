/*
  job
   - type: establish
   - operation: operation
   - options: options
*/

function Jobs() {}

Jobs.add = function(options) {
  var jobClass = null;
  var job = null;
  try {
    jobClass = require('./job/' + options.type);
  } catch(err) {
    console.error("Job type '" + options.type + "' does not exists!");
    return null;
  }
  if (jobClass) {
    job = new jobClass(options.id, options.options);
    process.nextTick(function() {
      job[options.operation]();
    });
    return job;
  }
  return null;
};

module.exports = Jobs;
