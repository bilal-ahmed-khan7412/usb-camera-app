const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveImages: (images) => ipcRenderer.invoke("save-images", images),
});
