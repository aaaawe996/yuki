let threads = JSON.parse(localStorage.getItem("threads") || "[]");
let deletedThreads = JSON.parse(localStorage.getItem("deletedThreads") || "[]");
let currentThreadIndex = null;
let sortDescending = true;

function saveData() {
  localStorage.setItem("threads", JSON.stringify(threads));
  localStorage.setItem("deletedThreads", JSON.stringify(deletedThreads));
}

function loadThreads() {
  const threadList = document.getElementById("threadList");
  const search = document.getElementById("searchInput").value.toLowerCase();

  let sortedThreads = [...threads];
  sortedThreads.sort((a, b) => {
    return sortDescending
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  });

  threadList.innerHTML = "";
  sortedThreads.forEach((thread, index) => {
    if (!thread.title.toLowerCase().includes(search)) return;
    const div = document.createElement("div");
    div.className = "thread";
    div.innerHTML = `
      <strong>${thread.title}</strong>
      <button class="thread-button" onclick="deleteThread(event, ${index})">削除</button>
    `;
    div.onclick = () => openThread(index);
    threadList.appendChild(div);
  });

  loadDeletedThreads();
}

document.getElementById("threadForm").onsubmit = function (e) {
  e.preventDefault();
  const title = document.getElementById("threadTitle").value;
  threads.push({
    title,
    createdAt: new Date(),
    comments: [],
  });
  saveData();
  document.getElementById("threadTitle").value = "";
  loadThreads();
};

function deleteThread(event, index) {
  event.stopPropagation();
  const removed = threads.splice(index, 1)[0];
  removed.deletedAt = new Date();
  deletedThreads.push(removed);
  saveData();
  loadThreads();
}

function loadDeletedThreads() {
  const container = document.getElementById("deletedThreadList");
  container.innerHTML = "";
  deletedThreads.forEach((thread, index) => {
    const div = document.createElement("div");
    div.className = "deleted-thread";
    div.innerHTML = `
      <strong>${thread.title}</strong><br>
      <small>削除日時: ${new Date(thread.deletedAt).toLocaleString()}</small><br>
      <button class="thread-button" onclick="permanentlyDeleteThread(${index})">完全削除</button>
    `;
    container.appendChild(div);
  });
}

function permanentlyDeleteThread(index) {
  if (confirm("このスレッドを完全に削除しますか？（元に戻せません）")) {
    deletedThreads.splice(index, 1);
    saveData();
    loadDeletedThreads();
  }
}

function toggleDeletedThreads() {
  const div = document.getElementById("deletedThreadList");
  const btn = document.querySelector(".toggle-btn");
  const shown = div.style.display !== "none";
  div.style.display = shown ? "none" : "block";
  btn.textContent = shown ? "▼ 表示" : "▲ 非表示";
}

function openThread(index) {
  currentThreadIndex = index;
  document.getElementById("threadTitleView").textContent = threads[index].title;
  document.getElementById("threadView").style.display = "block";
  document.getElementById("threadList").style.display = "none";
  document.getElementById("threadForm").style.display = "none";
  document.getElementById("searchSort").style.display = "none";
  loadComments();
}

function goBack() {
  document.getElementById("threadView").style.display = "none";
  document.getElementById("threadList").style.display = "block";
  document.getElementById("threadForm").style.display = "block";
  document.getElementById("searchSort").style.display = "flex";
}

function loadComments() {
  const commentBox = document.getElementById("comments");
  commentBox.innerHTML = "";
  const comments = threads[currentThreadIndex].comments;
  comments.forEach((c) => {
    const div = document.createElement("div");
    div.className = "comment";
    div.innerHTML = `<strong>${c.name}</strong>: ${c.text}<br><small>${new Date(c.time).toLocaleString()}</small>`;
    if (c.image) {
      const img = document.createElement("img");
      img.src = c.image;
      div.appendChild(img);
    }
    commentBox.appendChild(div);
  });
}

document.getElementById("commentForm").onsubmit = function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const text = document.getElementById("comment").value;
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];

  const reader = new FileReader();
  reader.onload = function () {
    const image = file ? reader.result : null;
    threads[currentThreadIndex].comments.push({
      name,
      text,
      image,
      time: new Date(),
    });
    saveData();
    document.getElementById("name").value = "";
    document.getElementById("comment").value = "";
    document.getElementById("imageInput").value = "";
    loadComments();
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    reader.onload();
  }
};

document.getElementById("sortButton").onclick = function () {
  sortDescending = !sortDescending;
  this.textContent = sortDescending ? "📅 並び替え: 新しい順" : "📅 並び替え: 古い順";
  loadThreads();
};

document.getElementById("searchInput").oninput = loadThreads;

loadThreads();
