#!/bin/bash

#npm run buildDev
# node ./src/index.js

pm2 start ./src/index.js --restart-delay=3000