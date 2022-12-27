# Notificator SSE Server

nodejs 서버 구동

SSE(Server-Send-Event) 프로토콜로 노티 전달

## 노티 구독

사용자(client)는 http://[Noti Server URL]/sse 로 접속

    var eventSource = new EventSource('http://123.212.190.178:3000/sse', {
        withCredentials: true
    });
    eventSource.addEventListener('notify', (e) => {
        console.log('eventSource', e.type, JSON.parse(e.data));
        webNotifyProcess(e.data); // webNotifyClient.js 함수 재사용
    });
    eventSource.addEventListener('appr', (e) => {
        console.log('eventSource', e.type, JSON.parse(e.data));
        sancProcess(e.data); // webNotifyClient.js 함수 재사용
    });

서버는 cookie의 userID 값으로 사용자 정보 획득

## 노티 발행

Alert으로부터 [POST] http(s)://[Noti Server URL]/webNotification 로 노티 수령

내용 parsing 후 접속된 사용자에게 노티 발행

## 서버 모니터링

    http(s)://[Noti Server URL]/

    접속 테스트 및 접속자 목록 확인

## 배포

### 그룹웨어 수정

    js 추가
        cp ./public/javascripts/eventSourceClient.js ~/hip/htdocs/webnotify/eventSourceClient.js

    htdocs/jsp/user/header-com.jsp
    	<script type="text/javascript" src="/webnotify/eventSourceClient.js?v=100105"></script>

    htdocs/webnotify/webNotifyClient.js
        websocket 접속 코드 비활성화
        webNotifyProcess 함수는 eventSourceClient.js에서 재사용함

### nodejs 설치

    node, npm, yarn

### 초기화

    $ yarn install

### 설정

config/default.json

노티 서버 port 설정

    {
        "server": {
            "port": 3000
        },
    }

config/production.json

그룹웨어 URL 설정. CORS

    {
        "header": {
            "Access-Control-Allow-Origin": "http://123.212.190.178:11000"
        }
    }

### 기동

    $ ./startup.sh

### 중지

    $ ./shutdown.sh

### 로그

    ./log/access.log
    ./log/sse.log

## Issue

Alert에서 동일 메시지를 2번씩 송신함

eventSourceClient.js webNotifyProcess 함수에서 중복에 대해 처리는 하고 있으나, 불필요
