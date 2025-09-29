// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveImages: (payload) => ipcRenderer.invoke("save-images", payload),
});
