const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const _ = require('lodash');
const CONSTANTS = require('../constants/index');

let parsedData;

const readyFileAsync = promisify(fs.readFile);

const getPoints = () => {
    if (_.isUndefined(parsedData)) {
        return readyFileAsync(path.join(__dirname, `..${CONSTANTS.DATA_FILE_PATH}`), 'utf8')
          .then(data => {
              try {
                  parsedData = JSON.parse(data);
              } catch (err) {
                  // err handle
              }
              return parsedData;
          });
    } else {
        return Promise.resolve(parsedData);
    }
};

module.exports = {getPoints};