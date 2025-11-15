const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveJSON: (content) => ipcRenderer.invoke('save-json', content),
    readRobloxSettings: async () => await ipcRenderer.invoke('read-roblox-settings'),
    readClipboard: async () => await ipcRenderer.invoke('read-clipboard'),
    checkForUpdates: async () => await ipcRenderer.invoke('check-for-updates'),
    openExternal: async (url) => await ipcRenderer.invoke('open-external', url),
    showLoading: () => ipcRenderer.send('show-loading'),
    closeLoading: () => ipcRenderer.send('close-loading')
});
