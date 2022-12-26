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
  path: path.join(__dirname, 'log')
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var sse = require('./app/sse');

var app = express();
var port = config.get('server.port');

app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", indexRouter);
app.use('/users', usersRouter);

// SSE
app.get('/sse', sse.accept);
app.get('/sse/:userId', sse.accept);
app.post('/webNotification', sse.send);

// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all('*', function (req, res) {
  res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});

app.listen(port, function () {
  console.log("Server starting... listen " + port);
});
