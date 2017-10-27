const _ = require('lodash');
const CONSTANTS = require('../constants/index');

const calcRequiredApiRequestNumber = () =>
  Math.ceil(CONSTANTS.LISTINGS_LIMIT / CONSTANTS.REQ_LIMIT);
const calcOffset = (index) =>
  index > 0 ? CONSTANTS.REQ_LIMIT * index : undefined;
const calcMinPrice = (priceMin) =>
  _.isUndefined(priceMin) ? 0 : priceMin + CONSTANTS.FILTER_PRICE_STEPS;
const calcMaxPrice = (priceMax) =>
  _.isUndefined(priceMax) ? CONSTANTS.FILTER_PRICE_STEPS : priceMax + CONSTANTS.FILTER_PRICE_STEPS;

module.exports = {
    calcOffset,
    calcMinPrice,
    calcMaxPrice,
    calcRequiredApiRequestNumber,
};