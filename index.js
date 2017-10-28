const fs = require('fs');
const path = require('path');
const dataInitializer = require('./services/dataInitializer');
const CONSTANTS = require('./constants/index');

const serverInitializer = require('./app').default;

if (fs.existsSync(path.resolve(__dirname, `.${CONSTANTS.DATA_FILE_PATH}`))) {
    serverInitializer();
} else {
    dataInitializer.init(CONSTANTS.CITY)
      .then(() => {
          serverInitializer();
      }).catch(err => {
        console.log('err', err)
    });
}
