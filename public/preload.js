const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveImages: (images) => ipcRenderer.send("save-images", images)
});
