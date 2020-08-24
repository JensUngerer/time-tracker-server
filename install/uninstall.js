  
const Service = require('node-windows').Service;
const programPath = require('./programPath.js');
const programName = require('./programName.js');
const debuggingPrint = require('./debuggingPrint.js');

// DEBUGGING:
debuggingPrint(programPath, programName);

// Create a new service object
var svc = new Service({
  name: programName,
  script: programPath
});

// Listen for the 'uninstall' event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();