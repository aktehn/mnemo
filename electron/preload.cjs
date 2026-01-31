const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    showPopup: (force = false) => ipcRenderer.send('show-popup', { force }),
    hidePopup: () => ipcRenderer.send('hide-popup'),
    updateSettings: (settings) => ipcRenderer.send('update-settings', settings),
    getSettings: (callback) => {
        ipcRenderer.send('get-settings');
        ipcRenderer.on('settings-data', (event, data) => callback(data));
    },
    onRefreshWord: (callback) => ipcRenderer.on('refresh-word', () => callback()),
    onOpenQuickAdd: (callback) => ipcRenderer.on('open-quick-add', () => callback()),
    getAllWords: () => ipcRenderer.invoke('get-all-words'),
    saveWord: (word) => ipcRenderer.invoke('save-word', word),
    deleteWord: (id) => ipcRenderer.invoke('delete-word', id),
    updateWord: (word) => ipcRenderer.invoke('update-word', word),
    log: (msg) => ipcRenderer.send('admin-log', msg),
});
