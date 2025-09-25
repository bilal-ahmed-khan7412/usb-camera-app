const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 🔑 preload bridge
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  const startUrl = process.env.ELECTRON_START_URL ||
                   `file://${path.join(__dirname, '../build/index.html')}`;
  win.loadURL(startUrl);
}

app.on('ready', createWindow);

// 📸 Save images when renderer requests
ipcMain.on("save-images", (event, images) => {
  const folder = path.join(app.getPath("pictures"), "UsbCameraApp");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }

  images.forEach((imgData, i) => {
    const base64Data = imgData.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(folder, `camera${i + 1}_${Date.now()}.png`);
    fs.writeFileSync(filePath, base64Data, "base64");
  });

  console.log("✅ Images saved to:", folder);
});
