const express = require('express');
const app = express();

const aranetData = require('./components/aranetData');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/newest', (req, res) => {
    aranetData.getNewest(req, res);
});

app.get('/min_max/:date', (req, res) => {
    const date = req.params.date;
    aranetData.getMinMax(req, res, date);
});

const server = app.listen(3000, function () {
    console.log('http://127.0.0.1:3000/');
});