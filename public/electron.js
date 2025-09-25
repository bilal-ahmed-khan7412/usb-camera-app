const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const isDev = process.env.ELECTRON_START_URL !== undefined;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    // Dev mode → React dev server
    win.loadURL(process.env.ELECTRON_START_URL);
  } else {
    // Prod mode → Load built React index.html
    win.loadFile(path.join(__dirname, "../build/index.html"));
  }
}

// 📸 IPC handler to save multiple images
ipcMain.handle("save-images", async (event, images) => {
  try {
    const saveDir = path.join(app.getPath("pictures"), "USBCameraApp");

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const savedPaths = [];

    images.forEach((dataUrl, index) => {
      // strip "data:image/png;base64,"
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const filename = `camera${index + 1}_${Date.now()}.png`;
      const filePath = path.join(saveDir, filename);

      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      savedPaths.push(filePath);
    });

    return savedPaths;
  } catch (err) {
    console.error("Failed to save images:", err);
    throw err;
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
