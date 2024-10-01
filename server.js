const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const dotEnv = require("dotenv");
dotEnv.config({ path: "./config.env" });

const apiLogger = require("./apiLogger")

const indoorIssueRoutes = require("./routes/db/indoorIssue")
const userRoutes = require("./routes/db/user")
const buildingRoutes = require("./routes/db/building")
const doorRoutes = require("./routes/db/door")
const rampRoutes = require("./routes/db/ramp")
const apiLogRoutes = require("./routes/db/apiLog")
const clientLogRoutes = require("./routes/db/clientLog")
const adaptiveNavRoutes = require("./routes/adaptiveNav")
const dbTestRoutes = require('./routes/dbTest');

const port = process.env.PORT || 5000;
const app = express();
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;

app.use(
  bodyParser.urlencoded({
      extended: false,
  }),
);
app.use(express.json());
app.use(cors());


// Static directory path
// app.use(express.static(path.join(__dirname, 'dist/polaris'))) // TODO: fix

//// API routes
// Root endpoint
app.get("/app/", (req, res, next) => {
  res.json({"message":"Your API works! (200)"});
  res.status(HTTP_STATUS_OK);
});

// Logger
app.use(apiLogger);

// Routes
app.use(indoorIssueRoutes);
app.use(userRoutes);
app.use(buildingRoutes);
app.use(doorRoutes);
app.use(rampRoutes);
app.use(apiLogRoutes);
app.use(clientLogRoutes);
app.use(adaptiveNavRoutes);
app.use(dbTestRoutes);

// app.get('*', (req, res) => {
//   res.sendFile(
//       path.join(__dirname, 'dist/polaris/index.html'),
//   )
// })

//// Default response for any request not addressed by the defined endpoints ////
app.use(function (req, res, next) {
  res.json({ "message": "Endpoint not found. (404)" });
  res.status(HTTP_STATUS_NOT_FOUND);
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.message)
})

// exit
process.on('SIGINT', () => {
  server.close();
});

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});