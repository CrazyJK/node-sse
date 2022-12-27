function callSse(btn) {
  const userid = document.getElementById('userid').value;
  if (userid.length === 0) {
    return;
  }
  btn.style.display = 'none';

  const eventSource = new EventSource('/sse/' + userid);
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
  eventSource.addEventListener('appr', (e) => {
    console.log(e.type, JSON.parse(e.data));
    prependData(e.type, e.data);
  });
}

function prependData(type, data) {
  const li = document.createElement('li');
  document.querySelector('#response').prepend(li);

  const typeLabel = document.createElement('label');
  typeLabel.innerHTML = type;

  const dataLabel = document.createElement('label');
  dataLabel.innerHTML = data;

  li.appendChild(typeLabel);
  li.appendChild(dataLabel);
}

function getUsers() {
  const userList = document.getElementById('userList');
  userList.innerHTML = '';

  fetch('/users').then((res) => res.json()).then((users) => {
    console.log('users', users);
    document.getElementById('userLength').innerHTML = users.length + ' users';

    if (users.length > 0) {
      for (let user of users) {
        const li = document.createElement('li');
        li.innerHTML = user;
        userList.appendChild(li);
      }
    } else {
      const li = document.createElement('li');
      li.innerHTML = 'no user';
      userList.appendChild(li);
    }
  });
}
