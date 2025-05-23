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
      displayDeletedThreads();
    });
}

function displayThreads(filtered = threads) {
  const threadList = document.getElementById('threadList');
  threadList.innerHTML = '';
  filtered.forEach((thread, index) => {
    const div = document.createElement('div');
    div.className = 'thread';
    div.innerHTML = `
      <h3>${thread.title}</h3>
      <p>${thread.content}</p>
      ${thread.image ? `<img src="${thread.image}" alt="Image">` : ''}
      <div class="buttons">
        <button onclick="deleteThread(${index})">削除</button>
      </div>
    `;
    threadList.appendChild(div);
  });
}

function displayDeletedThreads() {
  const deletedList = document.getElementById('deletedThreads');
  deletedList.innerHTML = '';
  deletedThreads.forEach((thread, index) => {
    const details = document.createElement('details');
    details.className = 'thread deleted';
    const summary = document.createElement('summary');
    summary.textContent = `${thread.title}（削除済み）`;
    const content = document.createElement('div');
    content.innerHTML = `
      <p>${thread.content}</p>
      ${thread.image ? `<img src="${thread.image}" alt="Image">` : ''}
      <p class="timestamp">削除日時: ${new Date(thread.deletedAt).toLocaleString()}</p>
      <div class="buttons">
        <button onclick="permanentlyDelete(${index})">完全削除</button>
      </div>
    `;
    details.appendChild(summary);
    details.appendChild(content);
    deletedList.appendChild(details);
  });
}

function createThread() {
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  const imageInput = document.getElementById('image');
  let image = '';

  if (!title || !content) return alert("タイトルと内容を入力してください");

  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image = e.target.result;
      threads.unshift({ title, content, image });
      saveAndReload();
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    threads.unshift({ title, content, image });
    saveAndReload();
  }
}

function deleteThread(index) {
  const password = prompt("削除パスワードを入力してください（082506）:");
  if (password !== "082506") {
    alert("パスワードが違います。");
    return;
  }
  const deleted = threads.splice(index, 1)[0];
  deleted.deletedAt = new Date().toISOString();
  deletedThreads.unshift(deleted);
  saveAndReload();
}

function permanentlyDelete(index) {
  deletedThreads.splice(index, 1);
  saveAndReload();
}

function saveAndReload() {
  saveThreads();
  displayThreads();
  displayDeletedThreads();
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('image').value = '';
}

function sortThreads() {
  const option = document.getElementById('sort').value;
  const sorted = [...threads];
  if (option === 'oldest') sorted.reverse();
  displayThreads(sorted);
}

function searchThreads() {
  const query = document.getElementById('search').value.toLowerCase();
  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      t.content.toLowerCase().includes(query)
  );
  displayThreads(filtered);
}

window.onload = loadThreads;
