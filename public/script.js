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

function createThread() {
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  const imageInput = document.getElementById('image');
  let image = '';

  if (!title || !content) return;

  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image = e.target.result;
      threads.unshift({ title, content, image, replies: [] });
      saveThreads();
      loadThreads();
    };
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    threads.unshift({ title, content, image, replies: [] });
    saveThreads();
    loadThreads();
  }

  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
  document.getElementById('image').value = '';
}

function displayThreads(filteredThreads = threads) {
  const container = document.getElementById('threadList');
  container.innerHTML = '';

  filteredThreads.forEach((thread, index) => {
    const div = document.createElement('div');
    div.className = 'thread';
    div.innerHTML = `
      <h3>${thread.title}</h3>
      <p>${thread.content}</p>
      ${thread.image ? `<img src="${thread.image}" alt="image">` : ''}
      <div class="buttons">
        <button onclick="deleteThread(${index})">削除</button>
      </div>
      <div class="replies">
        <h4>レス</h4>
        <div id="replies-${index}">
          ${thread.replies.map((r, i) => `<p><strong>${i + 1} 名前：${r.name}：</strong>${r.text}</p>`).join('')}
        </div>
        <input type="text" placeholder="名前" id="replyName-${index}">
        <input type="text" placeholder="コメント" id="replyText-${index}">
        <button onclick="addReply(${index})">返信</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function addReply(index) {
  const name = document.getElementById(`replyName-${index}`).value.trim() || '名無し';
  const text = document.getElementById(`replyText-${index}`).value.trim();
  if (!text) return;

  threads[index].replies.push({ name, text });
  saveThreads();
  loadThreads();
}

function deleteThread(index) {
  const password = prompt("削除パスワードを入力してください:");
  if (password !== "082506") {
    alert("パスワードが違います");
    return;
  }

  const deleted = threads.splice(index, 1)[0];
  deleted.deletedAt = new Date().toISOString();
  deletedThreads.unshift(deleted);
  saveThreads();
  loadThreads();
}

function permanentlyDelete(index) {
  deletedThreads.splice(index, 1);
  saveThreads();
  loadDeletedThreads();
}

function loadDeletedThreads() {
  const container = document.getElementById('deletedThreads');
  container.innerHTML = '';
  deletedThreads.forEach((thread, index) => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = `${thread.title}（削除済み）`;
    details.appendChild(summary);

    const div = document.createElement('div');
    div.className = 'thread deleted';
    div.innerHTML = `
      <p>${thread.content}</p>
      ${thread.image ? `<img src="${thread.image}" alt="image">` : ''}
      <p class="timestamp">削除日時: ${new Date(thread.deletedAt).toLocaleString()}</p>
      <button onclick="permanentlyDelete(${index})">完全削除</button>
    `;
    details.appendChild(div);
    container.appendChild(details);
  });
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
  const results = threads.filter(t =>
    t.title.toLowerCase().includes(query) || t.content.toLowerCase().includes(query)
  );
  displayThreads(results);
}

window.onload = loadThreads;
