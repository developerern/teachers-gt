const express = require('express');
const app = express();
const morgan = require('morgan');
const mysql = require('mysql');

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.use(express.static('./public'));

app.use(morgan('short'));
// app.use(morgan('combined'));

const api = require('./routes/api')

app.use("", api);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send({ message: err.message })
});

app.listen(80, () => {
  console.log("Server is up and listening on 80...")
});

module.exports = app;