require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const models = require('./models');

const indexRouter = require('./routes/index');
const invoiceRouter = require('./routes/invoice');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * For PUT/PATCH/DELETE
 */
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

/**
 * Sessions
 */
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const sessionConfig = {
  name: process.env.TITLE,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  cookie: {
    maxAge: 1000 * 60 * 60,
  },
  store: new MongoStore({ mongooseConnection: models }),
};

app.use(session(sessionConfig));

/**
 * Flash messages
 */
const flash = require('connect-flash');
app.use(flash());

app.use('/', indexRouter);
app.use('/invoice', invoiceRouter);

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

let port = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'tor' ? 3000 : 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`${process.env.TITLE} listening on ${port}!`);
});

module.exports = app;
