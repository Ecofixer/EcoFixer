// public/js/tenant.js

const btnInfo = document.getElementById("btn-info");
const btnLoadOrders = document.getElementById("btn-load-orders");
const btnCreate = document.getElementById("btn-create");

const newTitleInput = document.getElementById("new-title");
const createMsg = document.getElementById("create-msg");
const listMsg = document.getElementById("list-msg");
const ordersBody = document.getElementById("orders-body");
const jsonOutput = document.getElementById("json-output");

let currentFilter = "all";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return data;
}

// 取得後端資訊
btnInfo.addEventListener("click", async () => {
  listMsg.textContent = "";
  try {
    const data = await fetchJson("/api/info");
    jsonOutput.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    alert("取得後端資訊失敗：" + err.message);
  }
});

// 建立報修單
btnCreate.addEventListener("click", async () => {
  const title = newTitleInput.value.trim();
  createMsg.className = "msg";

  if (!title) {
    createMsg.textContent = "請先輸入報修內容";
    createMsg.classList.add("error");
    return;
  }

  try {
    btnCreate.disabled = true;
    createMsg.textContent = "送出中...";

    const data = await fetchJson("/api/repair/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    createMsg.textContent = "報修單建立成功！";
    createMsg.classList.add("success");
    newTitleInput.value = "";

    loadOrders(currentFilter);
  } catch (err) {
    createMsg.textContent = "建立失敗：" + err.message;
    createMsg.classList.add("error");
  } finally {
    btnCreate.disabled = false;
  }
});

// 載入報修單（房客這邊通常看全部即可）
async function loadOrders(filter = "all") {
  currentFilter = filter;
  listMsg.textContent = "載入中...";
  listMsg.className = "msg";

  try {
    const data = await fetchJson("/api/repair-orders");
    jsonOutput.textContent = JSON.stringify(data, null, 2);

    let list = data;
    if (filter !== "all") {
      list = data.filter(o => o.status === filter);
    }

    renderOrders(list);

    listMsg.textContent =
      list.length === 0 ? "目前沒有報修紀錄。" : "";
  } catch (err) {
    listMsg.textContent = "載入失敗：" + err.message;
    listMsg.classList.add("error");
  }
}

function renderOrders(list) {
  ordersBody.innerHTML = "";

  list.forEach(order => {
    const tr = document.createElement("tr");

    const created = new Date(order.createdAt).toLocaleString("zh-TW", {
      hour12: false
    });

    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.title}</td>
      <td>${order.status}</td>
      <td>${order.assignedWorker || "-"}</td>
      <td>${created}</td>
      <td>—</td>
    `;

    ordersBody.appendChild(tr);
  });
}

btnLoadOrders.addEventListener("click", () => loadOrders("all"));

// 也可以讓房客用篩選（可選）
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    document
      .querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    loadOrders(filter);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const first = document.querySelector('.filter-btn[data-filter="all"]');
  if (first) first.classList.add("active");
  loadOrders("all");
});

<script src="./js/tenant.js"></script>
