const CONSTANTS = require('../constants/index');
const httpService = require('./http');

const CLIENT_ID = '3092nxybyb0otqw18e8nh5nty';
const BASE_DOMAIN = 'https://api.airbnb.com/v2/';

const search = (location, offset, priceMin, priceMax) => {
    // console.log('offset, priceMin, priceMax', offset, priceMin, priceMax);
    return httpService.getApi({
        path: `${BASE_DOMAIN}search_results`,
        query: {
            location,
            _limit: CONSTANTS.REQ_LIMIT,
            _offset: offset,
            price_min: priceMin,
            price_max: priceMax,
            client_id: CLIENT_ID
        }
    }).then(response => response.search_results)
      .catch(() => {
          // console.log('Airbnd sever is down, I will try one more time', offset, priceMin, priceMax);
          return search(location, offset, priceMin, priceMax);
      })
};

const getReviews = (listingId, role) => httpService.getApi({
    path: `${BASE_DOMAIN}reviews`,
    query: {
        role,
        client_id: CLIENT_ID,
        listing_id: listingId
    }
});


//todo calendar days


module.exports = {
    search,
    getReviews
};