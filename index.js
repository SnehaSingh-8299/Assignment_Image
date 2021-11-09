"use strict";
require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const logger = require("morgan");
const bodyParser = require("body-parser");
const connection = require("./common/connection");
const responses = require("./common/responses");
const processes = require("./common/processes");
const v1Routes = require("./v1/routes");

app.use(cors());
app.use(responses());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use("/api/v1", v1Routes);


// app.use("/static", express.static(__dirname + "public/uploads"));

// 404, Not Found
app.use((req, res, next) => res.error(404, "NOT_FOUND"));

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

// Error handling
app.use((error, req, res, next) => {
    console.error(error);
    return res.error(400, error.message || error);
});

// Listening & Initializing
server.listen(process.env.PORT, async () => {
    console.log(`Environment:`, process.env.NODE_ENV);
    console.log(`Running on:`, process.env.PORT);
    connection.mongodb();
    processes.init();
});