const eventSource = new EventSource('/sse/001000106');
eventSource.onmessage = function (e) {
  console.log(e, e.data);
  prependData(e.type, e.data);
};
eventSource.addEventListener('connect', (e) => {
  console.log(e.type, JSON.parse(e.data));
  prependData(e.type, e.data);
});
eventSource.addEventListener('heartbeat', (e) => {
  console.log(e.type, JSON.parse(e.data));
  prependData(e.type, e.data);
});
eventSource.addEventListener('notify', (e) => {
  console.log(e.type, JSON.parse(e.data));
  prependData(e.type, e.data);
});

function prependData(type, data) {
  const li = document.createElement('li');
  document.querySelector('ol').prepend(li);

  const typeLabel = document.createElement('label');
  typeLabel.innerHTML = type;

  const dataLabel = document.createElement('label');
  dataLabel.innerHTML = data;

  li.appendChild(typeLabel);
  li.appendChild(dataLabel);
}
