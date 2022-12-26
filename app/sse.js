/**
 * Server-Sent-Event
 */

const config = require('config');
const logger = require('tracer').dailyfile({
  root: './log',
  maxLogFiles: 10,
  allLogsFileName: 'sse',
  level: 'debug'
});

const SSE_RESPONSE_HEADER = {
  'Connection': 'keep-alive',
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'X-Accel-Buffering': 'no',
  'Access-Control-Allow-Origin': config.get('header.Access-Control-Allow-Origin'),
  'Access-Control-Allow-Credentials': 'true',
};

const getUserId = (req) => {
  try {
    if (!req) return null;
    if (Boolean(req.body) && req.body.userId) return req.body.userId;
    if (Boolean(req.params) && req.params.userId) return req.params.userId;
    if (req.cookies && req.cookies.userID) return req.cookies.userID;
    return null;
  } catch (e) {
    logger.error('getUserId error', e);
    return null;
  }
};

global.usersStreams = new Map();

/**
 * sse 접속
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.accept = (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    logger.error('accept.no-user');
    next(new Errir('accept.no-user'));
    return;
  }
  const userKey = userId + '_' + Date.now();

  // Stores this connection
  usersStreams.set(userKey, { res, lastInteraction: null });
  logger.info('connect', userKey, usersStreams.keys());

  // Writes response header.
  res.writeHead(200, SSE_RESPONSE_HEADER);

  // sent connected message
  res.write(`event: connect\ndata: ${JSON.stringify({ key: userKey, time: Date.now() })}\n\n`);
  usersStreams.get(userKey).lastInteraction = Date.now();

  // Interval loop: heartbeat
  const maxInterval = 1000 * 55;
  const interval = 1000 * 3;
  let intervalId = setInterval(function () {
    if (!usersStreams.has(userKey)) return;
    if (Date.now() - usersStreams.get(userKey).lastInteraction < maxInterval) return;
    res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`);
    usersStreams.get(userKey).lastInteraction = Date.now();
  }, interval);

  // close event
  req.on('close', function () {
    // Breaks the interval loop on client disconnected
    clearInterval(intervalId);

    // Remove from connections
    usersStreams.delete(userKey);

    logger.debug('closed ', userKey, usersStreams.keys());
  });
};

/**
 * SSE 보내기
 * @param {*} userid
 * @param {*} type 이벤트 타입
 * @param {*} data
 * @returns
 */
exports.sendStream = async (userid, type, data) => {
  if (!userid) return;
  if (!type) return;
  if (!data) return;

  usersStreams.forEach((val, key) => {
    if (key.split('_')[0] === userid) {
      const { res } = val;
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      val.lastInteraction = Date.now();

      logger.debug('sent', key, data);
    }
  });
};

/**
 * sse로 메시지 전송
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.send = (req, res, next) => {
  const reqBody = req.body;
  logger.info('receive', reqBody, Object.keys(reqBody).length, Object.keys(reqBody)[0]);
  if (Object.keys(reqBody).length === 0 && reqBody.constructor === Object) {
    logger.error('send.no-data');
    next(new Error('send.no-data'));
    return;
  }

  const bodyJson = JSON.parse(Object.keys(reqBody)[0]);

  const typeAndId = bodyJson.id.split('_'); // notify_001000106
  const type = typeAndId[0]; // notify
  const id = typeAndId[1]; // 001000106
  const data = bodyJson.data; // {...}

  this.sendStream(id, type, data);
  logger.info('called sendStream', id, type, data);

  res.send(`received: ${JSON.stringify(bodyJson)}`);
};
