
// https://www.npmjs.com/package/smoothstore
const { Datastore } = require('smoothstore');
const data = new Datastore("TrimageSubdirectories");


let lastI = data.get('i') || 0;

console.log('lastI', lastI);
lastI ++;
data.set('i', lastI);
