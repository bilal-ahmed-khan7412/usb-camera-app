// app.js
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
    win.loadURL(process.env.ELECTRON_START_URL);
  } else {
    win.loadFile(path.join(__dirname, "../build/index.html"));
  }
}

// IPC handler
ipcMain.handle("save-images", async (event, { images, category }) => {
  try {
    // Strip trailing digits (e.g. corolla1 → corolla)
    const folderName = category.replace(/[0-9]+$/, "").toLowerCase();

    const saveDir = path.join(app.getPath("pictures"), folderName);

    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const savedPaths = [];

    images.forEach((dataUrl, index) => {
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
      const filename = `${folderName}_${Date.now()}_${index + 1}.png`;
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
