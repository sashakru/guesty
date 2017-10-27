const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const normalize =  require('normalize-to-range');


const _ = require('lodash');
const utils = require('../utils');

const airbnbService = require('./airbnb');

const CONSTANTS = require('../constants/index');

const writeFileAsync = promisify(fs.writeFile);
let totalData = [];

const calcDemandScore = (listing) => {
    const result = normalize([listing.star_rating, listing.star_rating]); //0.1 * listing.star_rating ;
    console.log('calcDemandScore result: ', result);

    return result;
}

const mapData = (data) =>
  data.map(obj => {
      return {
          lat: obj.listing.lat,
          lng: obj.listing.lng,
          ds: calcDemandScore(obj)
      }
  });

const createAndSaveDataAsJSON = (data) => {
    try {
        console.log('createAndSaveDataAsJSON data.length', data.length)
        const json = JSON.stringify(data);

        return writeFileAsync(
          path.resolve(__dirname, '../public/data.json'),
          json,
          'utf8'
        );
    } catch (err) {
    }
};

const init = (location) => {
    return dataFetch(
      location,
      utils.calcMinPrice(),
      utils.calcMaxPrice()
    )
      .then(mapData)
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
          console.log('totalData.length', totalData.length);

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