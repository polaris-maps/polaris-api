const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const issueRoutes = require("./routes/issue")
const port = process.env.PORT || 5001;
const app = express();

require("dotenv").config({ path: "./config.env" });

// TODO: refine

mongoose
    .connect(process.env.ATLAS_URI)
    .then((x) => {
        console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
    })
    .catch((err) => {
        console.error('Error connecting to mongo', err.reason)
    })

app.use(
  bodyParser.urlencoded({
      extended: false,
  }),
);
app.use(cors());

// Static directory path
app.use(express.static(path.join(__dirname, 'dist/polaris'))) // TODO: fix

// API root
app.use('/app', issueRoutes)

app.use(express.json());

app.use(issueRoutes);
 
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

// Base Route
app.get('/', (req, res) => {
  res.send('invalid endpoint')
})

app.get('*', (req, res) => {
  res.sendFile(
      path.join(__dirname, 'dist/polaris/index.html'),
  )
})

//// Default response for any request not addressed by the defined endpoints ////
app.use(function (req, res) {
  res.json({ "message": "Endpoint not found. (404)" });
  res.status(HTTP_STATUS_NOT_FOUND);
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.message)
})