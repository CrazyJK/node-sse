const es = new EventSource('/sse');
es.onmessage = function (e) {
  console.log(e, e.data);
};
es.addEventListener('connect', (e) => {
  console.log(e.type, JSON.parse(e.data));
});
es.addEventListener('heartbeat', (e) => {
  console.log(e.type, JSON.parse(e.data));
});
es.addEventListener('notify', (e) => {
  console.log(e.type, JSON.parse(e.data));
});
