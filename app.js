const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const PassportLocal = require('passport-local').Strategy;
const session = require('express-session');

const homeRouter = require('./routes/home/home');
const clientRouter = require('./routes/client/client');
const adminRouter = require('./routes/admin/admin');
const loginRouter = require('./routes/api/login');

const app = express();

require('dotenv').config();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SECRET_KEY));
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', homeRouter);
app.use('/client', clientRouter);
app.use('/admin', adminRouter);
app.use('/login', loginRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/*
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(new PassportLocal((user, pass, done)=>{
  //DATABSE
  //return done(null, user);
  //return done(null, false);
}));
passport.serializeUser((user, done)=>{
  done(null, user.id);
});
passport.deserializeUser((id, done)=>{
  
  //return done(null, user);
  
});
*/
module.exports = app;
