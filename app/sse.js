/* Server-Sent-Event */

/**
 * 사용자ID와 response 기억
 */
global.userMap = new Map();

const config = require('config');
const logLevel = config.get('server.log.level');
const sseHeartbeat = config.get('sse.heartbeat');
const sseHeader = config.get('sse.header');

const log = require('tracer').dailyfile({
  root: './logs',
  maxLogFiles: 10,
  allLogsFileName: 'sse',
  level: logLevel
});

/**
 * SSE 발행을 위한 response header 정보
 */
const SSE_RESPONSE_HEADER_DEFAULT = {
  // 'Connection': 'keep-alive',
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'X-Accel-Buffering': 'no',
  'Access-Control-Allow-Origin': 'header',
  'Access-Control-Allow-Credentials': 'true',
};
const SSE_RESPONSE_HEADER = { ...SSE_RESPONSE_HEADER_DEFAULT, ...sseHeader };

/**
 * userId 구하기
 * body > parameter > cookie
 * @param {*} req 
 * @returns 
 */
const getUserId = (req) => {
  try {
    if (!req) return null;
    if (Boolean(req.body) && req.body.userId) return req.body.userId;
    if (Boolean(req.params) && req.params.userId) return req.params.userId;
    if (req.cookies && req.cookies.userID) return req.cookies.userID;
    return null;
  } catch (e) {
    log.error('getUserId error', e);
    return null;
  }
};

/**
 * SSE 구독 처리
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const accept = (req, res, next) => {
  const userId = getUserId(req);
  if (!userId) {
    log.error('accept.no-user');
    next(new Error('accept.no-user'));
    return;
  }

  const userKey = userId + '_' + Date.now();
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Stores this connection
  userMap.set(userKey, { res, lastInteraction: Date.now() });
  log.debug('connect', userKey, ip);

  // Writes response header.
  res.writeHead(200, SSE_RESPONSE_HEADER);

  // sent connected message
  res.write(`event: connect\ndata: ${JSON.stringify({ key: userKey, time: Date.now() })}\n\n`);

  // Interval loop: heartbeat
  let heartbeatTimer = null;
  if (sseHeartbeat) {
    const MAX_INTERVAL = 1000 * 55;
    const INTERVAL_TIME = 1000 * 3;
    heartbeatTimer = setInterval(() => {
      if (!userMap.has(userKey)) return;
      if ((Date.now() - userMap.get(userKey).lastInteraction) < MAX_INTERVAL) return;
      res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`);
      userMap.get(userKey).lastInteraction = Date.now();
    }, INTERVAL_TIME);
  }

  // close event
  req.on('close', () => {
    // Breaks the interval loop on client disconnected
    if (heartbeatTimer == null) {
      clearInterval(heartbeatTimer);
    }

    // Remove from connections
    userMap.delete(userKey);

    log.debug('closed ', userKey);
  });
};

/**
 * alert으로 부터 메시지 수신
 * sse로 메시지 발행
 * @param {*} req request
 * @param {*} res response
 * @param {*} next
 */
const receive = (req, res, next) => {
  log.info('receive', 'headers', req.headers, 'body', req.body);

  const reqBody = req.body;
  const reqBodyKeys = Object.keys(reqBody);
  if (reqBodyKeys.length === 0 && reqBody.constructor === Object) {
    log.error('send.no-data');
    next(new Error('send.no-data'));
    return;
  }

  let bodyJson = null;
  if (reqBodyKeys.length === 1) {
    // alert으로 받은 메시지가 { "메시지본문" : "" } 형식으로 파싱되어서, key 부분만 꺼내서 다시 파싱
    bodyJson = JSON.parse(reqBodyKeys[0]);
  } else {
    // 'content-type': 'application/x-www-form-urlencoded' 으로 받은 경우
    bodyJson = reqBody;
  }
  log.info('parsing body', bodyJson);

  const idParts = bodyJson.id.split(';'); // notify_001000106;notify_001000108
  for (let idPart of idParts) {
    if (idPart === '') {
      continue;
    }
    const typeAndId = idPart.split('_'); // notify_001000106
    const type = typeAndId[0]; // notify
    const id = typeAndId[1]; // 001000106
    const data = bodyJson.data; // {...}

    publish(type, id, data).then(() => {
      log.info('published', type, id);
    });
  }

  res.send(`received: ${JSON.stringify(bodyJson)}`);
};

/**
 * 개별 사용자에게 SSE 발행
 * @param {*} type 이벤트 타입
 * @param {*} userid
 * @param {*} data
 * @returns
 */
const publish = async (type, userid, data) => {
  if (!type || !userid || !data) return;

  userMap.forEach((val, key) => {
    if (key.split('_')[0] === userid) {
      const { res } = val;
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
      val.lastInteraction = Date.now();

      log.info('publish', key, data);
    }
  });
};


exports.accept = accept;
exports.receive = receive;
