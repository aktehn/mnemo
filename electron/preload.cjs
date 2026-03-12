const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    showPopup: (force = false) => ipcRenderer.send('show-popup', { force }),
    hidePopup: () => ipcRenderer.send('hide-popup'),
    updateSettings: (settings) => ipcRenderer.send('update-settings', settings),
    getSettings: (callback) => {
        ipcRenderer.send('get-settings');
        ipcRenderer.removeAllListeners('settings-data');
        ipcRenderer.on('settings-data', (event, data) => callback(data));
    },
    // Listen for settings pushed FROM main process (e.g. on popup load or when admin changes settings)
    // This is the key fix: popup gets authoritative settings from main, not from its own localStorage
    onSettingsUpdate: (callback) => {
        ipcRenderer.removeAllListeners('settings-data');
        ipcRenderer.on('settings-data', (event, data) => callback(data));
    },
    // FIXED: Remove all previous listeners before registering a new one.
    // Previously, every call to onRefreshWord() added a NEW listener without
    // removing the old one, causing stale closures to accumulate and the 
    // card to appear "stuck" because old callbacks fired with outdated word lists.
    onRefreshWord: (callback) => {
        ipcRenderer.removeAllListeners('refresh-word');
        ipcRenderer.on('refresh-word', () => callback());
    },
    onOpenQuickAdd: (callback) => {
        ipcRenderer.removeAllListeners('open-quick-add');
        ipcRenderer.on('open-quick-add', () => callback());
    },
    getAllWords: () => ipcRenderer.invoke('get-all-words'),
    saveWord: (word) => ipcRenderer.invoke('save-word', word),
    deleteWord: (id) => ipcRenderer.invoke('delete-word', id),
    updateWord: (word) => ipcRenderer.invoke('update-word', word),
    log: (msg) => ipcRenderer.send('admin-log', msg),
});

