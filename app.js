var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
const { body, validationResult } = require('express-validator');
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var flash = require('connect-flash');
var mongoose = require('mongoose');
var db = mongoose.connection;
var routes = require('./routes/index.js');
var users = require('./routes/users.js');
// var message = require('express-messages');

var app = express();

// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch((err) => console.log(err));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Handle Sessions
app.use(session({
  secret:'secret',
  saveUninitialized: true,
  resave: true
}));

// Validator
const errorFormatter = (param, msg, value) => {
  var namespace = param.split('.'),
   root = namespace.shift(),
   formParam = root;

  while (namespace.length) {
    formParam += '[' + namespace.shift() + ']';
  }
  return { param: formParam, msg, value };
};
const myValidationResult = validationResult.withDefaults({ formatter: errorFormatter });

// Use it in your route
app.post('/register', [
  body('email').isEmail(),
  body('name').notEmpty(),
  // Add more validations as needed
], (req, res) => {
  const errors = myValidationResult(req);

  if (!errors.isEmpty()) {
    return res.render('register', { errors: errors.array() });
  }

  // Continue with registration logic
});

// const myValidationResult = validationResult.withDefaults({ formatter: errorFormatter });

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
