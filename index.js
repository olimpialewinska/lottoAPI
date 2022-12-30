const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");
const request = require("request");
const req = require("express/lib/request");
const { db } = require("./util/admin");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

const lottoRoutes = require("./api/routes/routes");
app.use("/", lottoRoutes);


app.listen(port, () => console.log("API Server is running"));
