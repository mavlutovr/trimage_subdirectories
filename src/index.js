// Config
const config = require('config');


// DB
// https://www.npmjs.com/package/smoothstore
const { Datastore } = require('smoothstore');
const data = new Datastore("TrimageSubdirectories");




let lastI = data.get('i') || 0;

console.log('lastI', lastI);
console.log('directoryAbsolutePath', config.directoryAbsolutePath);
lastI ++;
data.set('i', lastI);
