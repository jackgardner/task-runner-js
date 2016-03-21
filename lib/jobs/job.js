const logger = require('nice-simple-logger')({});
const Promise = require('bluebird');
const fs = require('fs');

const JobLoader = function () {
  this.connectors = {};
  const connectorDirectory = __dirname + '/../connectors';
  fs.readdir(connectorDirectory, (err, names) => {
    names.forEach(name => {
      const moduleName = name.split('.')[0];
      this.connectors[moduleName] = require(connectorDirectory + '/' + name);
    });
  });
};


JobLoader.prototype.loadJob = function (manifest) {

  return new Promise((resolve, reject) => {
    // TODO Build a cache

    const manifestDirectory = __dirname + '/' + manifest + '/';
    const jobManifiest = require(manifestDirectory + 'manifest.json');
    if (!jobManifiest.main) reject(Error('no main source file defined'));

    const module = require(manifestDirectory + jobManifiest.main)(this.connectors[jobManifiest.connector]);
    resolve(module);
  });
};

module.exports = JobLoader;