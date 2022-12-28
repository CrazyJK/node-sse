# Notificator SSE Server

nodejs 서버

SSE(Server-Send-Event) 프로토콜로 노티 전달

## 노티 구독

사용자(client)는 http://[Noti Server URL]/sse 로 접속

```js
var eventSource = new EventSource('http://[Noti Server URL]/sse', {
  withCredentials: true,
});
eventSource.addEventListener('notify', (e) => {
  console.log('eventSource', e.type, JSON.parse(e.data));
  webNotifyProcess(e.data); // webNotifyClient.js 함수 재사용
});
eventSource.addEventListener('appr', (e) => {
  console.log('eventSource', e.type, JSON.parse(e.data));
  sancProcess(e.data); // webNotifyClient.js 함수 재사용
});
```

서버는 cookie의 userID 값으로 사용자 정보 획득

## 노티 발행

Alert으로부터 [POST] http(s)://[Noti Server URL]/webNotification 로 노티 수령

내용 parsing 후 접속된 사용자에게 노티 발행

### 노티 종류

1. appr from 한글클라이언트

```
    content-type: application/x-www-form-urlencoded; charset=UTF-8
    parameters:
           id=appr_001003200
        &data={"command":"refresh"}
```

2. notify from Alert

```
    content-type: application/x-www-form-urlencoded
    parameters:
        '{"id":"notify_001000210","data":{...}}'=''
    * k=v 형식의 form-data로 전달되기 때문에 key만 추출하여 사용해야 함
```

## 배포

### 그룹웨어 수정

    js 추가
        cp ./public/javascripts/eventSourceClient.js ~/hip/htdocs/webnotify/eventSourceClient.js

    htdocs/jsp/user/header-com.jsp
    	<script type="text/javascript" src="/webnotify/eventSourceClient.js?v=100105"></script>

    htdocs/webnotify/webNotifyClient.js
        websocket 접속 코드 비활성화
        webNotifyProcess, sancProcess 함수(eventSourceClient.js)는 재사용 가능

### nodejs

    # install node, npm, yarn

    $ yarn install

### 설정

- config/default.json (공통)
- config/development.json (개발)
- config/production.json (운영)

```json
{
  "server": {
    "port": 3000 // 노티 서버 port 설정
  },
  "header": {
    "Access-Control-Allow-Origin": "http://123.212.190.178:11000" // 그룹웨어 URL 설정. CORS
  },
  "log": {
    "level": "info" // 로그(logs/sse.log) 레벨
  },
  "heartbeat": {
    "activate": false // 정기적으로 ping을 보낼지 여부
  }
}
```

### 기동 / 중지

    $ ./startup.sh
    $ ./shutdown.sh

### 로그

    ./log/access.log
    ./log/sse.log

## Issue

Alert에서 동일 메시지를 2번씩 송신함

eventSourceClient.js webNotifyProcess 함수에서 중복에 대해 처리는 하고 있으나, 불필요

## 서버 모니터링

접속 테스트 및 접속자 목록 확인

http://[Noti Server URL]/

## REF

HTTP/1.1 VS HTTP/2
https://ijbgo.tistory.com/26

포트 접속 수 확인

    windows
        netstat -ano | findstr :3001

    linux
        netstat -na | grep :443
