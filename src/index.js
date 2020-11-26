
const config = require('config'); // Config
const fs = require('fs');
const filePathKey = 'lastFilePath2';
const { exec } = require("child_process");
const pretty = require('prettysize');


// DB
// https://www.npmjs.com/package/smoothstore
const { Datastore } = require('smoothstore');
const data = new Datastore("TrimageSubdirectories");
let stepN = 0;

let numberOfRun = data.get('numberOfRun') || 0;
numberOfRun ++;
console.log('NUMBER_OF_RUN', numberOfRun);
data.set('numberOfRun', numberOfRun);


let compressedBytes = data.get('compressedBytes') || 0;


const parsePath = path => {

  let ret = {};

  let arr = path.split('/');
  ret.filename = arr.pop();
  ret.dir = arr.join('/');

  return ret;
};


const isDirectory = path => {
  let stat = fs.statSync(path);
  return stat.isDirectory();
};


const getNextFilePath = (lastFilePath, prevFileName) => {

  // Search next file
  // let path = parsePath(lastFilePath);
  if (prevFileName) {
    prevFileName = prevFileName.replace(/(\.png|\.jpg)(.)+$/, '$1');
  }

  if (!fs.existsSync(lastFilePath)) {
    let path = parsePath(lastFilePath);
    lastFilePath = path.dir;
  }

  if (isDirectory(lastFilePath)) {
    
  }

  else {
    let path = parsePath(lastFilePath);
    lastFilePath = path.dir;
    prevFileName = path.filename;
  }

  let items = fs.readdirSync(lastFilePath);
  items.sort((a, b) => {
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  });

  let newElement;

  // Тут сделано так, чтобы пропускать файлы с правами, к которым нет доступа
  let ok = false;
  do {
    if (prevFileName) {
      let currentIndex = items.indexOf(prevFileName);
      // console.log('items -1', items[currentIndex - 1]);
      // console.log('items 0', items[currentIndex]);
      // console.log('items +1', items[currentIndex + 1]);
      // console.log('items +2', items[currentIndex + 2]);
      // console.log('items +3', items[currentIndex + 3]);
      newElement = items[currentIndex + 1];

      if (newElement) {
        try {
          if (/(\.png|\.jpg)/.test(newElement) && !/(\.png|\.jpg)$/.test(newElement)) {
            throw new Error('Strange file name: ' + newElement);
          }

          fs.statSync(lastFilePath + '/' + newElement);
          ok = true;
        }
        catch (e) {
          console.error(e);
          prevFileName = newElement;
          console.error('NO FILE ', newElement);
        }
      }
      else {
        ok = true;
      }
    }
    else {
      newElement = items[0];
      ok = true;
    }
  }
  while (!ok)

  // console.log('prevFileName', prevFileName);
  // console.log('newElement', newElement);

  // Есть следующий элемент
  if (newElement) {
    let newPath = lastFilePath + '/' + newElement;
    if (isDirectory(newPath)) {
      return getNextFilePath(newPath);
    }

    else {
      return newPath;
    }
  }

  // Нет следующего элемента
  else if (lastFilePath !== config.directoryAbsolutePath) {
    let parent = parsePath(lastFilePath);
    return getNextFilePath(parent.dir, parent.filename);
  }
  
};


const step = () => {
  console.log(' ');
  stepN ++;
  console.log('STEP '+stepN);

  let lastFilePath = data.get(filePathKey) || config.get('directoryAbsolutePath');

  if (!fs.existsSync(lastFilePath))
    throw new Error('lastFilePath is not exists ('+(new Date().getTime())+'): ' + lastFilePath);


  let filePath = getNextFilePath(lastFilePath);
  if (filePath) {
    console.log('file', filePath);

    let stats = fs.statSync(filePath);
    let oldSize = stats.size;

    const result = (percentReg, error, stdout, stderr) => {

      console.log('percentReg', percentReg);

      stats = fs.statSync(filePath);
      let newSize = stats.size;

      let percent = stdout.match(percentReg) || stderr.match(percentReg);

      console.log('stdout', stdout);
      console.log('percent', percent);

      if (percent) {
        console.log(
          'Compressed:     ',
          pretty(oldSize), ' -->> ' + pretty(newSize),
          '     ' + percent[1] + '%'
        );
      }
      else {
        if (error) console.error('error', error);
        if (stderr) console.error('stderr', stderr);
        console.log('stdout', stdout);
      }

      let delta = oldSize - newSize;
      console.log('compressed file', pretty(delta));

      compressedBytes += delta;

      data.set('compressedBytes', compressedBytes);
      console.log('compressed total', pretty(compressedBytes));


      data.set(filePathKey, filePath);

      setTimeout(step, 1000);
    };

    // PNG
    if (filePath.indexOf('.png') !== -1) {
      exec(
        '/usr/bin/optipng ' + filePath,
        {
          timeout: 30 * 1000,
        },
        (error, stdout, stderr) => {
          result(
            /([0-9\.]+)% decrease/,
            error, stdout, stderr
          );
        }
      );
    }

    // JPG
    else if (filePath.indexOf('.jpg') !== -1
      || filePath.indexOf('.jpeg') !== -1) {
      
      exec(
        '/usr/bin/jpegoptim ' + filePath,
        {
          timeout: 30 * 1000,
        },
        (error, stdout, stderr) => {
          //console.log('stdout', stdout);

          result(
            /\(([0-9\.]+)%\)/,
            error, stdout, stderr
          );
        }
      );
    }
  }

  else {
    console.log('finished');
  }
};

step();




// false && exec(
//   '/usr/bin/trimage -f /home/roma/www/tuteta4/box/worlds/0/img/zoom_1/2015/3-Mar/19/risovanie_0_0___12:06:52.png',
//   (error, stdout, stderr) => {
//     // if (error) console.error(error);
//     // if (stderr) console.error(stderr);

//     console.log('stdout', stdout);

//     stdout.match(/Old Size: ([0-9]+) ([A-Z]+)/);
//   }
// );

// let stdout = 'stdout File: /home/roma/www/tuteta4/box/worlds/0/img/zoom_1/2015/3-Mar/19/risovanie_0_0___12:06:52.png, Old Size: 1 MB, New Size: 1 KB, Ratio: 0.0%';

// let oldSize = stdout.match(/Old Size: ([0-9]+) ([A-Z]+)/);
// console.log('oldSize', oldSize);

// let newSize = stdout.match(/New Size: ([0-9]+) ([A-Z]+)/);
// console.log('newSize', newSize);






// let lastI = data.get('i') || 0;

// console.log('lastI', lastI);
// console.log('directoryAbsolutePath', config.directoryAbsolutePath);
// lastI ++;
// data.set('i', lastI);
