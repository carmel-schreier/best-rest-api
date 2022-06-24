var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var clientsRouter = require('./routes/clients');
var cardsRouter = require('./routes/cards');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client')));

app.use('/api', indexRouter);
app.use('/api', clientsRouter);
app.use('/api', cardsRouter);

module.exports = app;