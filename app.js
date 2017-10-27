const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const express = require('express');
const readyFileAsync = promisify(fs.readFile);

module.exports.default = () => {
    const app = express();

    app.set('port', (process.env.PORT || 5000));
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('view engine', 'ejs');

    app.get('/', function (req, res) {

        console.log('reading file from: ', path.join(__dirname, './public/data.json'));
        readyFileAsync(path.join(__dirname, './public/data.json'), 'utf8')
          .then(data => {
              console.log('JSON.parse(data).length', JSON.parse(data).slice(0, 4002).length)
              res.render('index', {
                  data: JSON.parse(data).slice(0, 2800)
              })
          });
    });

    app.listen(app.get('port'), function () {
        console.log(`Example app listening on port ${app.get('port')}!`)
    });
};