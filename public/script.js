let threads = [];
let deletedThreads = [];

function saveThreads() {
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ threads, deletedThreads }),
  });
}

function loadThreads() {
  fetch('/data')
    .then((res) => res.json())
    .then((data) => {
      threads = data.threads || [];
      deletedThreads = data.deletedThreads || [];
      displayThreads();
      loadDeletedThreads();
    });
}

function displayThreads(filteredThreads = threads) {
  const threadList = document.getElementById('threadList');
  threadList.innerHTML = '';
  filteredThreads.forEach((thread, index) => {
    const threadDiv = document.createElement('div');
    threadDiv.className = 'thread';
    threadDiv.innerHTML = `
      <h3>${thread.title}</h3>
      <p>${thread.content}</p>
      ${thread.image ? `<img src="${thread.image}" alt="Image">` : ''}
      <div class="buttons">
        <button onclick="deleteThread(${index})">削除</button>
      </div>
    `;
    threadList.appendChild(threadDiv);
  });
}

function loadDeletedThreads() {
  const deletedContainer = document.getElementById('deletedThreads');
  deletedContainer.innerHTML = '';
  deletedThreads.forEach((thread, index) => {
    const wrapper = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `${thread.title}（削除済み）`;
    wrapper.appendChild(summary);

    const div = document.createElement('div');
    div.className = 'thread deleted';
    div.innerHTML = `
      <p>${thread.content}</p>
      ${thread.image ? `<img src="${thread.image}" alt="Image">` : ''}
      <p class="timestamp">削除日時: ${new Date(thread.deletedAt).toLocaleString()}</p>
      <div class="buttons">
        <button onclick="permanentlyDelete(${index})">完全削除</button>
      </div>
    `;
    wrapper.appendChild(div);
    deletedContainer.appendChild(wrapper);
  });
}

function createThread() {
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  const imageInput = document.getElementById('image');
  let image = '';

  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image = e.target.result;
      threads.unshift({ title, content, image });
      saveThreads();
      loadThreads();
      document.getElementById('title').value = '';
      document.getElementById('content').value = '';
      document.getElementById('image').value = '';
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    threads.unshift({ title, content, image });
    saveThreads();
    loadThreads();
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('image').value = '';
  }
}

function deleteThread(index) {
  const password = prompt("このスレッドを削除するにはパスワードを入力してください:");
  if (password !== "082506") {
    alert("パスワードが違います。");
    return;
  }

  const deleted = threads.splice(index, 1)[0];
  deleted.deletedAt = new Date().toISOString();
  deletedThreads.unshift(deleted);
  saveThreads();
  loadThreads();
  loadDeletedThreads();
}

function permanentlyDelete(index) {
  deletedThreads.splice(index, 1);
  saveThreads();
  loadDeletedThreads();
}

function sortThreads() {
  const value = document.getElementById('sort').value;
  if (value === 'newest') {
    displayThreads([...threads]);
  } else {
    displayThreads([...threads].reverse());
  }
}

function searchThreads() {
  const query = document.getElementById('search').value.toLowerCase();
  const results = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query)
  );
  displayThreads(results);
}

window.onload = loadThreads;
