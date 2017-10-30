const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const _ = require('lodash');
const utils = require('../utils');
const airbnbService = require('./airbnb');
const CONSTANTS = require('../constants/index');
const moment = require('moment');

const writeFileAsync = promisify(fs.writeFile);

let totalData = [];
let maxDemandScore = Number.NEGATIVE_INFINITY;
let minDemandScore = Number.POSITIVE_INFINITY;

const delay = (time) => new Promise(resolve => setTimeout(() => resolve(), time));
const getTotalBookedDatesCount = (availability) => availability.filter(i => !i.available).length;

const calcDemandScore = (listing, lastMonthAvailability) => {
    const totalBookedDatesCount = getTotalBookedDatesCount(lastMonthAvailability);

    return (
      0.1 * listing.star_rating +
      0.1 * (listing.bedrooms / listing.person_capacity) +
      0.2 * (listing.bathrooms / listing.person_capacity) +
      0.2 * (listing.beds / listing.person_capacity) +
      0.6 * (totalBookedDatesCount / CONSTANTS.DAYS_IN_MONTH)
    );
};

const saveMinMaxDemandScore = (ds) => {
    if (ds > maxDemandScore) maxDemandScore = ds;
    if (ds < minDemandScore) minDemandScore = ds;
};

const mapDataToDemandedPoints = (data) =>
  data.map(({listing, lastMonthAvailability}) => {
      const demandScore = calcDemandScore(listing, lastMonthAvailability);
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
      .then(fetchPropertiesAvailability)
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

const fetchPropertiesAvailability = (properties) => {
    const reqChunkLength = 100;
    let startFrom = 0;
    let end = reqChunkLength;

    function requestHandler() {
        console.log(`Fetching availability from: ${startFrom}, to: ${end}`);
        return Promise.all(
          properties.slice(startFrom, end).map(property => {
              return getLastMonthAvailability(property.listing.id)
                .then(lastMonthAvailability => {
                    property.lastMonthAvailability = lastMonthAvailability;

                    return property;
                });
          })
        ).then(() => {
            return startFrom < properties.length ?
              delay(2000).then(requestHandler)
              : properties;
        });
    }

    return requestHandler();
};

const getLastMonthAvailability = (id) => {
    const now = moment().format(CONSTANTS.DATE_FORMAT);
    const montAgo = moment().subtract(CONSTANTS.DAYS_IN_MONTH, 'd').format(CONSTANTS.DATE_FORMAT);

    return airbnbService.getPropertyAvailability(id, montAgo, now);
};

module.exports = {init};