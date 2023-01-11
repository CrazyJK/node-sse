# Notificator SSE Server

base: nodejs + express

SSE(Server-Send-Event) 프로토콜로 노티 전달

## 노티 구독

사용자(client)는 `http://[Noti Server URL]/sse` 로 접속

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

Alert으로부터 [POST] `http(s)://[Noti Server URL]/webNotification` 로 노티 수령

내용 parsing 후 접속된 사용자에게 노티 발행

### 노티 종류

1. `appr` from 한글클라이언트

```
    content-type: application/x-www-form-urlencoded; charset=UTF-8
    parameters:
           id=appr_001003200
        &data={"command":"refresh"}
```

2. `notify` from Alert

```
    content-type: application/x-www-form-urlencoded
    parameters:
        '{"id":"notify_001000210","data":{...}}'=''
    * k=v 형식의 form-data로 전달되기 때문에 key만 추출하여 사용해야 함
```

## 배포

### 그룹웨어 수정

    [js 추가]
        cp ./public/javascripts/eventSourceClient.js ~/hip/htdocs/webnotify/eventSourceClient.js
        cp ./public/javascripts/eventsource.min.js ~/hip/htdocs/webnotify/eventsource.min.js // EvenetSource Polyfill for IE

    [htdocs/jsp/user/header-com.jsp]
    	<script type="text/javascript" src="/webnotify/eventSourceClient.js?v=100105"></script>

    [htdocs/webnotify/webNotifyClient.js]
        websocket 접속 코드 비활성화
        webNotifyProcess, sancProcess 함수(eventSourceClient.js)는 재사용 가능

    [jhoms/conf/jhomscfg.xml]
        <property name="jhoms.system.refresh_server" value="https://lucy.handysoft.co.kr:3443" />

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
    "available-protocols": [
      // 선택 가능한 프로토콜 목록
      "http",
      "https",
      "http2"
    ],
    "protocol": "http", // 사용할 프로토콜
    "port": 3000, // 서버 포트
    "certificates": {
      // 프로토콜로 https, http2 를 선택했을때 사용할 인증서
      "ca": "cert/***.crt",
      "key": "cert/***.key",
      "cert": "cert/***.crt"
    },
    "log": {
      "level": "debug" // 로그(logs/sse.log) 레벨
    }
  },
  "sse": {
    "header": {
      "Access-Control-Allow-Origin": "http://123.212.190.178:11000" // 그룹웨어 서버 URL for CORS
    },
    "heartbeat": true // 클라이언트에게 정기적으로 ping을 보낼지 여부. 55초
  }
}
```

### 기동 / 중지

    $ ./startup.sh
    Notificator SSE Server initializing...
    nohup: redirecting stderr to stdout
    Notificator SSE Server is running pid=367433

    $ ./shutdown.sh
    Shutting down Notificator SSE Server: 161353

### 프로세스 확인

    $ ps -ef | grep SSE
    handy     375067       1  0 10:38 pts/2    00:00:00 node ./app Notificator_SSE

### 로그

    ./log/access.log
    ./log/sse.log

## 모니터링

### 접속 테스트 및 접속자 목록 확인.

`http://[Noti Server URL]/`

### 포트 접속 수 확인

    $ netstat -na | grep :3443
    tcp6       0      0 :::3443                 :::*                    LISTEN
    tcp6       0      0 123.212.190.178:3443    10.30.7.172:59928       ESTABLISHED
    tcp6       0      0 123.212.190.178:3443    10.30.7.189:60518       ESTABLISHED
    tcp6       0      0 123.212.190.178:3443    10.30.7.180:55980       ESTABLISHED
    tcp6       0      0 123.212.190.178:3443    10.30.7.207:52131       ESTABLISHED

windows: `netstat -ano | findstr :3001`

## REF

### HTTP/1.1 VS HTTP/2

https://ijbgo.tistory.com/26

### eventsource polyfill

https://cdnjs.com/libraries/eventsource-polyfill
