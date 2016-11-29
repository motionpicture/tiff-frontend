"use strict";
const express = require('express');
// import cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// import multer = require('multer');
let app = express();
// view engine setup
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// for parsing multipart/form-data
// let storage = multer.memoryStorage()
// app.use(multer({ storage: storage }).any());
// app.use(cookieParser());
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
// import {useContainer, useExpressServer} from "routing-controllers";
// import {Container} from "typedi";
// its important to set container before any operation you do with routing-controllers,
// including importing controllers
// useContainer(Container);
// now import all our controllers. alternatively you can specify controllerDirs in routing-controller options
routing_controllers_1.useExpressServer(app, {
    controllers: [__dirname + "/controllers/**/*.js"],
    middlewares: [__dirname + "/middlewares/**/*.js"],
    defaultErrorHandler: false // disable default error handler, only if you have your own error handler
});
module.exports = app;
