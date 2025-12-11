// public/js/worker.js

const btnInfo = document.getElementById("btn-info");
const btnLoadOrders = document.getElementById("btn-load-orders");
const listMsg = document.getElementById("list-msg");
const ordersBody = document.getElementById("orders-body");
const jsonOutput = document.getElementById("json-output");

let currentFilter = "assigned"; // 工班預設看「已派單」

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

// 載入報修單
async function loadOrders(filter = currentFilter) {
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
      list.length === 0 ? "目前沒有需要處理的報修單。" : "";
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
      <td>
        <button class="complete-btn" data-id="${order.id}">完成</button>
        <button class="cancel-btn" data-id="${order.id}">取消</button>
      </td>
    `;

    ordersBody.appendChild(tr);
  });
}

// 表格按鈕：完成 / 取消
ordersBody.addEventListener("click", async e => {
  const completeBtn = e.target.closest(".complete-btn");
  const cancelBtn = e.target.closest(".cancel-btn");

  // 完成
  if (completeBtn) {
    const id = completeBtn.dataset.id;
    if (!confirm(`確定把 #${id} 標記為完成？`)) return;

    try {
      await fetchJson(`/api/repair/${id}/complete`, { method: "PATCH" });
      loadOrders(currentFilter);
    } catch (err) {
      alert("完成失敗：" + err.message);
    }
    return;
  }

  // 取消
  if (cancelBtn) {
    const id = cancelBtn.dataset.id;
    if (!confirm(`確定取消 #${id} 這筆報修？`)) return;

    try {
      await fetchJson(`/api/repair/${id}/cancel`, { method: "PATCH" });
      loadOrders(currentFilter);
    } catch (err) {
      alert("取消失敗：" + err.message);
    }
  }
});

// 篩選按鈕
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

btnLoadOrders.addEventListener("click", () => loadOrders("assigned"));

// 頁面載入
window.addEventListener("DOMContentLoaded", () => {
  const assignedBtn = document.querySelector(
    '.filter-btn[data-filter="assigned"]'
  );
  if (assignedBtn) assignedBtn.classList.add("active");
  loadOrders("assigned");
});

<script src="./js/worker.js"></script>