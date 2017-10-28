const path = require('path');
const dal = require('./dal');

const express = require('express');

module.exports.default = () => {
    const app = express();

    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('view engine', 'ejs');

    app.get('/', function (req, res) {
        dal.getPoints()
          .then(points => {
              res.render('index', {points});
          });
    });

    app.listen(app.get('port'), function () {
        console.log(`Example app listening on port ${app.get('port')}!`)
    });
};