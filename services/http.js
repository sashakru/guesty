const request = require('superagent');

function getNewRequest(options) {
    const {path, query, payload, method} = options;
    const req = request[method](path);

    if (query) req.query(query);
    if (payload) req.send(payload);

    return req;
}

function makeRequest(method, options) {
    const {path, query, payload} = options;

    return new Promise((resolve, reject) => {
        getNewRequest({
            path,
            query,
            method,
            payload,
        }).end((err, res) => {
            if (err) {
                reject(err && err.response && err.response.body);
            } else {
                resolve(res.body);
            }
        });
    });
}

const getApi = options => makeRequest('get', options);
const putApi = options => makeRequest('put', options);
const postApi = options => makeRequest('post', options);
const deleteApi = options => makeRequest('del', options);

module.exports = {
    getApi,
    putApi,
    postApi,
    deleteApi
};
