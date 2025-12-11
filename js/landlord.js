const btnInfo = document.getElementById("btn-info");
const btnLoadOrders = document.getElementById("btn-load-orders");
const listMsg = document.getElementById("list-msg");
const ordersBody = document.getElementById("orders-body");
const jsonOutput = document.getElementById("json-output");

btnInfo.addEventListener("click", async () => {
  const res = await fetch("/api/info");
  const data = await res.json();
  jsonOutput.textContent = JSON.stringify(data, null, 2);
});

btnLoadOrders.addEventListener("click", () => {
  loadOrders("all");
});

async function loadOrders(filter = "all") {
  listMsg.textContent = "載入中...";
  const res = await fetch("/api/repair-orders");
  const data = await res.json();

  jsonOutput.textContent = JSON.stringify(data, null, 2);

  let list = data;
  if (filter !== "all") {
    list = data.filter(o => o.status === filter);
  }

  renderOrders(list);
  listMsg.textContent = "";
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
        <button class="assign-btn" data-id="${order.id}">指派</button>
        <button class="complete-btn" data-id="${order.id}">完成</button>
        <button class="cancel-btn" data-id="${order.id}">取消</button>
      </td>
    `;

    ordersBody.appendChild(tr);
  });
}
<script src="./js/landlord.js"></script>
