const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // keep React separate from Node
      contextIsolation: true,
    },
  });

  // Dev vs Production
  const startUrl = process.env.ELECTRON_START_URL || 
                   `file://${path.join(__dirname, '../build/index.html')}`;

  win.loadURL(startUrl);

  // Optional: open dev tools
  win.webContents.openDevTools();
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
