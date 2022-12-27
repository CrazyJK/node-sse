var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var rfs = require('rotating-file-stream');
var cors = require('cors');
var config = require('config');

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs')
});

var app = express();
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
app.use("/", indexRouter);
app.use('/users', usersRouter);

// SSE
var sse = require('./app/sse');
app.get('/sse', sse.accept);
app.get('/sse/:userId', sse.accept);
app.post('/webNotification', sse.receive);

// configuation
var port = config.get('server.port');
var logLevel = config.get('log.level');
var heatbeatActivate = config.get('heartbeat.activate');
var headerAccessControlAllowOrigin = config.get('header.Access-Control-Allow-Origin');

// start server
app.listen(port, () => {
  console.log(`Notificator SSE Server starting... listen ${port}!\n  NODE_ENV = ${process.env.NODE_ENV}\n  log.level = ${logLevel}\n  heartbeat.activate = ${heatbeatActivate}\n  headerAccessControlAllowOrigin = ${headerAccessControlAllowOrigin}`);
});
