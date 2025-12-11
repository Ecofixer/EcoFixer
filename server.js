<script src="./app.js" defer></script>
// server.js
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// -------------------- 假資料（記憶體版 DB） --------------------
let repairOrders = [
  {
    id: 1,
    title: "浴室水龍頭漏水",
    status: "pending",          // pending / assigned / completed / cancelled
    assignedWorker: null,
    createdAt: new Date()
  },
  {
    id: 2,
    title: "冷氣不冷",
    status: "assigned",
    assignedWorker: "阿宏師傅",
    createdAt: new Date()
  }
];

// -------------------- 系統資訊 --------------------
app.get("/api/info", (req, res) => {
  res.json({
    name: "EcoFixer Backend",
    author: "柏文",
    status: "running",
    time: new Date()
  });
});

// -------------------- 報修單 CRUD --------------------
app.get("/api/repair-orders", (req, res) => {
  res.json(repairOrders);
});

// 建立報修單（房客）
app.post("/api/repair/create", (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title 是必填欄位" });
  }

  const newOrder = {
    id: repairOrders.length + 1,
    title,
    status: "pending",
    assignedWorker: null,
    createdAt: new Date()
  };

  repairOrders.push(newOrder);

  res.json({
    message: "報修單建立成功",
    data: newOrder
  });
});

// 指派工班（房東）
app.patch("/api/repair/:id/assign", (req, res) => {
  const repairId = parseInt(req.params.id);
  const { workerName } = req.body;

  const order = repairOrders.find(o => o.id === repairId);

  if (!order) {
    return res.status(404).json({ error: "找不到資料" });
  }
  if (!workerName) {
    return res.status(400).json({ error: "workerName 必填" });
  }

  order.assignedWorker = workerName;
  order.status = "assigned";

  res.json({
    message: "指派成功",
    data: order
  });
});

// 完成報修（工班）
app.patch("/api/repair/:id/complete", (req, res) => {
  const repairId = parseInt(req.params.id);
  const order = repairOrders.find(o => o.id === repairId);

  if (!order) {
    return res.status(404).json({ error: "找不到資料" });
  }

  order.status = "completed";

  res.json({
    message: "已標記為完成",
    data: order
  });
});

// 取消報修（房東 / 房客）
app.patch("/api/repair/:id/cancel", (req, res) => {
  const repairId = parseInt(req.params.id);
  const order = repairOrders.find(o => o.id === repairId);

  if (!order) {
    return res.status(404).json({ error: "找不到資料" });
  }

  order.status = "cancelled";

  res.json({
    message: "已取消報修",
    data: order
  });
});

// -------------------- 前端頁面路由 --------------------
app.get("/landlord", (req, res) => {
  res.sendFile(__dirname + "/public/landlord.html");
});

app.get("/tenant", (req, res) => {
  res.sendFile(__dirname + "/public/tenant.html");
});

app.get("/worker", (req, res) => {
  res.sendFile(__dirname + "/public/worker.html");
});

// -------------------- 啟動伺服器 --------------------
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});