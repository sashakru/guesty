const fs = require('fs');
const path = require('path');
const dataInitializer = require('./services/dataInitializer');
const CONSTANTS = require('./constants/index');

const serverInitializer = require('./app').default;

if (fs.existsSync(path.resolve(__dirname, './public/data.json'))) {
    serverInitializer();
} else {
    dataInitializer.init(CONSTANTS.CITY)
      .then(() => {
          // console.log('length', data.length)
          serverInitializer();
      }).catch(err => {
        console.log('err', err)
    });
}
