$(document).ready(function () {
	//노티파이사용 이고 웹알림사용 일때만 허용한다.
	if (!useNotify || !useWebNotify) {
		return;
	}
	//알림은 Master Tab에만 허용한다.
	if (typeof linkage !== "undefined" && linkage === "N") {
		return;
	}

	var eventSource = new EventSource('http://123.212.190.178:3000/sse', {
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
