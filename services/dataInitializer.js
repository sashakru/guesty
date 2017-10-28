const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const _ = require('lodash');
const utils = require('../utils');
const airbnbService = require('./airbnb');
const CONSTANTS = require('../constants/index');

const writeFileAsync = promisify(fs.writeFile);

let totalData = [];
let maxDemandScore = Number.NEGATIVE_INFINITY;
let minDemandScore = Number.POSITIVE_INFINITY;

const calcDemandScore = (listing) => (
  0.2 * listing.star_rating +
  0.3 * (listing.bathrooms / listing.person_capacity) +
  0.3 * (listing.beds / listing.person_capacity) +
  0.2 * (listing.bedrooms / listing.person_capacity)
);

const saveMinMaxDemandScore = (ds) => {
    if (ds > maxDemandScore) maxDemandScore = ds;
    if (ds < minDemandScore) minDemandScore = ds;
};

const mapDataToDemandedPoints = (data) =>
  data.map(({listing}) => {
      const demandScore = calcDemandScore(listing);
      saveMinMaxDemandScore(demandScore);
      return {
          lat: listing.lat,
          lng: listing.lng,
          ds: demandScore
      }
  });

const normalizeDemandScore = (points) => {
    const demandScoreDelta = maxDemandScore - minDemandScore;
    return points.map(point => {
        point.ds = (point.ds - minDemandScore) / demandScoreDelta;
        return point;
    });
};

const createAndSaveDataAsJSON = (data) => {
    try {
        const json = JSON.stringify(data);
        return writeFileAsync(
          path.resolve(__dirname, `..${CONSTANTS.DATA_FILE_PATH}`),
          json,
          'utf8'
        );
    } catch (err) {
        //err handle
    }
};

const init = (location) => {
    console.log('Start init data process, be patient...');

    return dataFetch(
      location || CONSTANTS.CITY,
      utils.calcMinPrice(),
      utils.calcMaxPrice()
    )
      .then(mapDataToDemandedPoints)
      .then(normalizeDemandScore)
      .then(createAndSaveDataAsJSON)
};

const dataFetch = (location, priceMin, priceMax) => {
    const requests = [...Array(utils.calcRequiredApiRequestNumber())]
      .map((val, index) => {
          return airbnbService.search(
            location,
            utils.calcOffset(index),
            priceMin,
            priceMax
          );
      });

    return Promise.all(requests)
      .then(responses => {
          totalData = [
              ...totalData,
              ...(_.compact(_.flatten(responses)))
          ];

          console.log('Data received, total data length: ', totalData.length);

          return totalData.length > CONSTANTS.REQUIRED_DATA_LENGTH ?
            totalData :
            dataFetch(
              location,
              utils.calcMinPrice(priceMin),
              utils.calcMaxPrice(priceMax),
            );
      });
};

module.exports = {init};