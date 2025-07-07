process.env.NODE_ENV = "production"; // 🟢 Đặt ngay đầu tiên

const { app, BrowserWindow } = require("electron");
const { startServer } = require("../dist/index.js");

app.whenReady().then(async () => {
  await startServer(); // ⏳ server sẽ dùng serveStatic nếu NODE_ENV === "production"

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:5000");
});
