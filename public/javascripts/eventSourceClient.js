/**
 * hip/htdocs/webnotify/eventSourceClient.js
 * 그룹웨어에 추가될 소스
 */
$(document).ready(function () {
	//노티파이사용 이고 웹알림사용 일때만 허용한다.
	if (!useNotify || !useWebNotify) {
		return;
	}
	//알림은 Master Tab에만 허용한다.
	if (typeof linkage !== "undefined" && linkage === "N") {
		return;
	}

	var url = null;
	url = 'http://123.212.190.178:3000/sse'; // was와 notificator가 같은 프로토콜일때
	url = 'https://lucy.handysoft.co.kr:3443/sse/' + userID; // 프로토콜이 다를때, 쿠키전달이 안되므로

	var eventSource = new EventSource(url, {
		withCredentials: true
	});
	eventSource.addEventListener('connect', function (e) {
		console.log('eventSource', e.type, JSON.parse(e.data));
	});
	eventSource.addEventListener('heartbeat', function (e) {
		console.log('eventSource', e.type, JSON.parse(e.data));
	});
	eventSource.addEventListener('notify', function (e) {
		console.log('eventSource', e.type, JSON.parse(e.data));
		webNotifyProcess(e.data); // webNotifyClient.js 함수 재사용
	});
	eventSource.addEventListener('appr', function (e) {
		console.log('eventSource', e.type, JSON.parse(e.data));
		sancProcess(e.data); // webNotifyClient.js 함수 재사용
	});
});
