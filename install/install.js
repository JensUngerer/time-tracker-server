const Service = require('node-windows').Service;
const programPath = require('./programPath.js');
const programName = require('./programName.js');
const debuggingPrint = require('./debuggingPrint.js');
const port = 3021;

// DEBUGGING:
debuggingPrint(programPath, programName);

// Create a new service object
const svc = new Service({
  name:programName,
  description: 'The Time-Tracker as a Windows - Service',
  script: programPath,
  env:{
    name: 'NODE_ENV',
    value: 'production'
  }
});

// Listen for the 'install' event, which indicates the
// process is available as a service.
svc.on('install',() => {
  svc.start();
});

// Just in case this file is run twice.
svc.on('alreadyinstalled',() => {
  console.log('This service is already installed.');
});

// Listen for the 'start' event and let us know when the
// process has actually started working.
svc.on('start',() => {
  console.log(svc.name+' started!\nVisit http://127.0.0.1:' + port +  ' to see it in action.');
});

// Install the script as a service.
svc.install();
