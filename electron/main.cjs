process.env.NODE_ENV = "production"; // ✅ Thêm dòng này ở đầu
const path = require("path");
const { app, BrowserWindow } = require("electron");

app.whenReady().then(async () => {
  const { serverReady } = require("../dist/index.js");
  await serverReady; // ✅ Đợi server chạy xong

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL("http://localhost:5000"); // ✅ Sau khi server chạy thì mới load UI
});
