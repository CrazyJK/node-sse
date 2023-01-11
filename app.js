/**
 * Notificator SSE App
 */

const http = require('http');
const https = require('https');
const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const config = require('config');
const express = require('express');
const http2Express = require('http2-express-bridge')
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');

// create a rotating write stream
const accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs')
});

// configuation
const protocol = config.get('server.protocol');
const port = config.get('server.port');
const certificates = config.get('server.certificates');
const certificatesCa = config.get('server.certificates.ca');
const certificatesKey = config.get('server.certificates.key');
const certificatesCert = config.get('server.certificates.cert');
const logLevel = config.get('server.log.level');
const sseHeader = config.get('sse.header');
const sseHeatbeat = config.get('sse.heartbeat');

let server = null;
let app = null;
let options = null;

switch (protocol) {
  case 'http':
    app = express();
    server = http.createServer(app);
    break;
  case 'https':
    app = express();
    options = {
      ca: fs.readFileSync(path.join(__dirname, certificatesCa)),
      key: fs.readFileSync(path.join(__dirname, certificatesKey)),
      cert: fs.readFileSync(path.join(__dirname, certificatesCert))
    };
    server = https.createServer(options, app);
    break;
  case 'http2':
    app = http2Express(express);
    options = {
      ca: fs.readFileSync(path.join(__dirname, certificatesCa)),
      key: fs.readFileSync(path.join(__dirname, certificatesKey)),
      cert: fs.readFileSync(path.join(__dirname, certificatesCert)),
      allowHTTP1: true
    };
    server = http2.createSecureServer(options, app);
    break;
  default:
    throw new Error('illegal protocol ' + protocol);
}

server.listen(port, () => {
  console.log(`Notificator SSE Server starting...
    NODE_ENV  = ${process.env.NODE_ENV}
    server.protocol = ${protocol}
    server.port = ${port}
    server.certificates = ${JSON.stringify(certificates)}
    server.log.level = ${logLevel}
    sse.header = ${JSON.stringify(sseHeader)}
    sse.heartbeat = ${sseHeatbeat}`);
});


app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
app.use("/", indexRouter);
app.use('/users', usersRouter);

// SSE
const sse = require('./app/sse');
app.get('/sse', sse.accept);
app.get('/sse/:userId', sse.accept);
app.post('/webNotification', sse.receive);
