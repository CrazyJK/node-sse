var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var sse = require('./sse');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// SSE
app.get('/sse/:userId', sse.accept);
app.post('/sse', sse.send);

// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all('*', function (req, res) {
  res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});

module.exports = app;
