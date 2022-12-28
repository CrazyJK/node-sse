let tmpUserNumber = 0;

function callMultiSse() {
  const clientLength = Number(clientSize.value);
  for (let i = 0; i < clientLength; i++) {
    callSse();
  }
}

function callSse(btn) {
  let userid = document.getElementById('userid').value;
  if (userid.length === 0) {
    userid = 'user' + ++tmpUserNumber;
  }
  if (btn) {
    btn.style.display = 'none';
  }

  const eventSource = new EventSource('/sse/' + userid);
  eventSource.onmessage = prependData;
  eventSource.addEventListener('connect', prependData);
  eventSource.addEventListener('heartbeat', prependData);
  eventSource.addEventListener('notify', prependData);
  eventSource.addEventListener('appr', prependData);
}

function prependData(e) {
  const type = e.type;
  const data = e.data;
  console.log(new Date(), type, data);

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
