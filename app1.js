const express = require('express');
const path =require('path');
const favicon =require('serve-favicon');
const logger = require('morgan');
const cookieParser =require('cookie-parser');
const bodyParser =require('body-parser');
const session =require('express-session');
const passport =require('passport');
const LocalStartegy =require('passport-local').Strategy;
const multer =require('multer');
const flash =require('connect-flash');
const mongo =require('mongodb');
const mongoose =require('mongoose');
const db =mongoose.connection;

app.use(expressValidator())
const routes = require('./routes/index.js');
const users = require('./routes/users.js');
const { ExpressValidator } = require('express-validator');

const app = express();

app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');

var uploads= app.use(multer({dest:'./uploads'}))
// app.use(favicon(path.join(__dirname,'public')))

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser);
app.use(express.static(path.join(__dirname,'views')));

app.use(session({
    secret:'secret',
    saveUninitialized: true,
    resave:true
}))
app.use(passport.initialize());
app.use(passport.session());

app.use(ExpressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));
  
  app.use(require('connect-flash')());
  app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
  });

app.use('/',routes)
app.use('/users',users)

app.use((req,res,next)=>{
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }
  
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
  
(async()=>{
  try{
    await mongoose.connect("mongodb://localhost:27017/login")
    console.log("DB connected");
    const onlistening =()=>{
      console.log("listening port 5000")
    };
    app.listen(5000,onlistening)

  }
  catch(error){
    console.log('error');
    throw error;


  }
})

  
module.exports = app;