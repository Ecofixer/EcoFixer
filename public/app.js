// app.js －－ EcoFixer 前端介面

const btnInfo = document.getElementById("btn-info");
const btnLoadOrders = document.getElementById("btn-load-orders");
const btnCreate = document.getElementById("btn-create");

const newTitleInput = document.getElementById("new-title");
const createMsg = document.getElementById("create-msg");
const listMsg = document.getElementById("list-msg");
const ordersBody = document.getElementById("orders-body");
const jsonOutput = document.getElementById("json-output");

let currentFilter = "all";

// 取得後端資訊
btnInfo.addEventListener("click", async () => {
  createMsg.textContent = "";
  listMsg.textContent = "";

  try {
    const res = await fetch("/api/info");
    const data = await res.json();
    jsonOutput.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    alert("取得後端資訊失敗：" + err.message);
  }
});

// 取得報修單列表（按鈕）
btnLoadOrders.addEventListener("click", () => {
  loadOrders("all");
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

    const res = await fetch("/api/repair/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "建立失敗");
    }

    createMsg.textContent = "報修單建立成功！";
    createMsg.classList.add("success");
    newTitleInput.value = "";

    // 重新載入列表（保留目前篩選）
    loadOrders(currentFilter);
  } catch (err) {
    createMsg.textContent = "失敗：" + err.message;
    createMsg.classList.add("error");
  } finally {
    btnCreate.disabled = false;
  }
});

// 載入報修單並依照篩選顯示
async function loadOrders(filter = "all") {
  currentFilter = filter;
  listMsg.textContent = "載入中...";
  listMsg.className = "msg";

  try {
    const res = await fetch("/api/repair-orders");
    const data = await res.json();

    jsonOutput.textContent = JSON.stringify(data, null, 2);

    let list = data;
    if (filter !== "all") {
      list = data.filter(o => o.status === filter);
    }

    renderOrders(list);

    if (list.length === 0) {
      listMsg.textContent = "目前沒有符合條件的資料。";
    } else {
      listMsg.textContent = "";
    }
  } catch (err) {
    listMsg.textContent = "載入失敗：" + err.message;
    listMsg.classList.add("error");
  }
}

// 把報修單渲染到表格
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
        <button class="assign-btn" data-id="${order.id}">指派</button>
        <button class="complete-btn" data-id="${order.id}">完成</button>
        <button class="cancel-btn" data-id="${order.id}">取消</button>
      </td>
    `;

    ordersBody.appendChild(tr);
  });
}

// 表格內按鈕（事件委派）
ordersBody.addEventListener("click", async e => {
  const assignBtn = e.target.closest(".assign-btn");
  const completeBtn = e.target.closest(".complete-btn");
  const cancelBtn = e.target.closest(".cancel-btn");

  // 指派工班
  if (assignBtn) {
    const id = assignBtn.dataset.id;
    const workerName = window.prompt("請輸入要指派的工班名稱：", "阿豪師傅");
    if (!workerName) return;

    try {
      const res = await fetch(`/api/repair/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "指派失敗");

      alert(`指派成功：${data.data.assignedWorker}`);
      loadOrders(currentFilter);
    } catch (err) {
      alert("指派失敗：" + err.message);
    }
    return;
  }

  // 完成
  if (completeBtn) {
    const id = completeBtn.dataset.id;
    if (!confirm(`確定把 #${id} 標記為完成？`)) return;

    try {
      const res = await fetch(`/api/repair/${id}/complete`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "完成失敗");
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
      const res = await fetch(`/api/repair/${id}/cancel`, {
        method: "PATCH"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取消失敗");
      loadOrders(currentFilter);
    } catch (err) {
      alert("取消失敗：" + err.message);
    }
    return;
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

// 頁面載入時：預設選「全部」並載入資料
window.addEventListener("DOMContentLoaded", () => {
  const firstFilter = document.querySelector('.filter-btn[data-filter="all"]');
  if (firstFilter) firstFilter.classList.add("active");
  loadOrders("all");
});