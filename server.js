const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const issueRoutes = require("./routes/issue")
const port = process.env.PORT || 5000;
const app = express();

require("dotenv").config({ path: "./config.env" });

// TODO: clean up and finish/fix this file

// mongoose
//     .connect('mongodb://127.0.0.1:27017/mydatabase')
//     .then((x) => {
//         console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
//     })
//     .catch((err) => {
//         console.error('Error connecting to mongo', err.reason)
//     })

app.use(
  bodyParser.urlencoded({
      extended: false,
  }),
);
app.use(cors());

// Static directory path
app.use(express.static(path.join(__dirname, 'dist/polaris')))

// API root
app.use('/app/', issueRoutes)

app.use(express.json());

app.use(require("./routes/record"));
// get driver connection
const dbo = require("./db/conn");
 
app.listen(port, () => {
  // perform a database connection when server starts
  // dbo.connectToServer(function (err) {
  //   if (err) console.error(err);
 
  // });
  console.log(`Server is running on port: ${port}`);
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404))
})

// Base Route
app.get('/', (req, res) => {
  res.send('invaild endpoint')
})

// app.get('*', (req, res) => {
//   res.sendFile(
//       path.join(__dirname, 'dist/polaris/index.html'),
//   )
// })

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message)
  if (!err.statusCode) err.statusCode = 500
  res.status(err.statusCode).send(err.message)
})