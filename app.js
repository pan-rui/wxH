var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
const schedule=require('node-schedule');
var tes = require('./services/BankZH');
// var mp = require('./routes/wechat_mp');
// var wechat = require('wechat');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.set('view engine', 'ejs');
// app.set('view engine', 'html');
// app.engine('html', require('ejs').renderFile);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
// app.use('/msg',mp.reply);
// app.use('/verify',wech);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

/*var date=new Date();
let rule1= new schedule.RecurrenceRule();
rule1.minute = [1, 11, 21, 31, 41, 51];*/
schedule.scheduleJob('1 */1 14-21 * * 1-5',function(){tes.downGold()});
schedule.scheduleJob('21 */1 14-21 * * 1-5',function(){tes.downZhai()});
schedule.scheduleJob('41 */1 14-21 * * 1-5',function(){tes.downFX()});
schedule.scheduleJob('1 * 14-21 * * 1-5',function(){tes.sendNews()});

module.exports = app;
