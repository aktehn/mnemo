/**
 * Electron Main Process
 * 
 * Manages the Electron application lifecycle, window creation, and IPC communication.
 * Implements the spaced repetition popup system with focus mode support.
 * 
 * @module electron/main
 */

const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs-extra');

// Application state
let adminWindow;
let popupWindow;
let tray;

// Environment detection
const isDev = process.env.NODE_ENV === 'development';
const DEV_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Configuration
const POPUP_CONFIG = {
    WIDTH: parseInt(process.env.VITE_POPUP_WIDTH) || 400,
    HEIGHT: parseInt(process.env.VITE_POPUP_HEIGHT) || 450,
    SCREEN_PADDING: 20,
};

const POPUP_INTERVAL_MS = 10000; // 10 seconds for testing (adjust in production)

/**
 * Creates the admin window for vocabulary management
 * 
 * @returns {BrowserWindow} The created admin window instance
 */

function createAdminWindow() {
    adminWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        title: 'Mnemo',
        icon: path.join(__dirname, '../src/assets/logo.png'),
    });

    if (isDev) {
        adminWindow.loadURL(`${DEV_URL}/#/admin`);
        adminWindow.webContents.openDevTools();
    } else {
        adminWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'admin' });
    }

    adminWindow.on('closed', () => {
        adminWindow = null;
        // If admin is closed, should we quit? Maybe keep tray alive?
        // For now, let's keep app running if tray exists.
    });
}

/**
 * Creates the popup window for vocabulary cards
 * 
 * The popup appears in the bottom-right corner of the screen
 * and shows vocabulary cards at scheduled intervals.
 * 
 * @returns {BrowserWindow} The created popup window instance
 */
function createPopupWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

    popupWindow = new BrowserWindow({
        width: POPUP_CONFIG.WIDTH,
        height: POPUP_CONFIG.HEIGHT,
        x: screenWidth - POPUP_CONFIG.WIDTH - POPUP_CONFIG.SCREEN_PADDING,
        y: screenHeight - POPUP_CONFIG.HEIGHT - POPUP_CONFIG.SCREEN_PADDING,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false, // Initially hidden
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
    });

    if (isDev) {
        popupWindow.loadURL(`${DEV_URL}/#/popup`);
    } else {
        popupWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'popup' });
    }

    // Show popup automatically when content is loaded
    popupWindow.webContents.on('did-finish-load', () => {
        console.log('Popup window loaded, showing automatically...');
        popupWindow.show();
        popupWindow.webContents.send('refresh-word');
    });

    // Prevent closing, just hide
    popupWindow.on('close', (e) => {
        if (!app.isQuitting) {
            e.preventDefault();
            popupWindow.hide();
        }
    });
}

/**
 * Creates the system tray icon with context menu
 * 
 * Provides quick access to admin panel and popup testing.
 */
function createTray() {
    // Determine icon path
    const iconPath = path.join(__dirname, '../src/assets/logo.png');

    // Create native image and resize for better quality in tray
    let trayIcon = nativeImage.createFromPath(iconPath);
    // Standard tray size for Windows is usually small (16x16 or 32x32)
    // We resize to 32x32 for high DPI displays to avoid aliasing artifacts from large downscaling
    trayIcon = trayIcon.resize({ width: 32, height: 32 });

    tray = new Tray(trayIcon);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Admin', click: () => {
                if (adminWindow) {
                    adminWindow.show();
                } else {
                    createAdminWindow();
                }
            }
        },
        {
            label: 'Test Popup', click: () => {
                if (popupWindow) popupWindow.show();
            }
        },
        { type: 'separator' },
        {
            label: 'Quit', click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);
    tray.setToolTip('Mnemo');
    tray.setContextMenu(contextMenu);
}

// --- User Settings & Focus Mode Logic ---

/**
 * User settings for focus mode and popup scheduling
 * @type {Object}
 */
let userSettings = {
    workHoursStart: "09:00",
    workHoursEnd: "18:00",
    focusModeEnabled: true,
    frequency: 15 // minutes
};

/**
 * Checks if the current time is within focus mode work hours
 * 
 * @returns {boolean} True if popup should be shown based on focus mode settings
 */
function checkFocusMode() {
    if (!userSettings.focusModeEnabled) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeVal = currentHour * 60 + currentMinute;

    const [startH, startM] = userSettings.workHoursStart.split(':').map(Number);
    const [endH, endM] = userSettings.workHoursEnd.split(':').map(Number);

    const startTimeVal = startH * 60 + startM;
    const endTimeVal = endH * 60 + endM;

    // Show ONLY during work hours
    return currentTimeVal >= startTimeVal && currentTimeVal < endTimeVal;
}

/**
 * Application initialization
 * Creates windows, tray, and starts popup interval timer
 */
app.whenReady().then(() => {
    createAdminWindow();
    createPopupWindow();
    createTray();

    // Register global shortcut for easy adding/viewing
    globalShortcut.register('CommandOrControl+Shift+A', () => {
        if (popupWindow) {
            console.log('⌨️ Global Shortcut Triggered');
            popupWindow.show();
            popupWindow.webContents.send('refresh-word');
            // Optionally focus:
            popupWindow.focus();
        }
    });

    // Dynamic scheduling for popups
    const scheduleNextPopup = () => {
        const frequencyMs = (userSettings.frequency || 15) * 60 * 1000;

        // For testing purposes, if frequency is very short (e.g. 5 min), 
        // we might want a faster debug cycle. 
        // But let's stick to user settings. 
        // NOTE: For development debugging, you might want to force a shorter time.
        // const delay = isDev ? 10000 : frequencyMs; 
        const delay = isDev ? 10000 : frequencyMs; // Keep 10s for dev testing as requested before

        setTimeout(() => {
            if (checkFocusMode()) {
                if (popupWindow) {
                    console.log('⏰ Triggering scheduled popup...');
                    popupWindow.show();
                    popupWindow.webContents.send('refresh-word');
                }
            } else {
                console.log('zzz Focus Mode: Outside work hours. Popup suppressed.');
                if (popupWindow && popupWindow.isVisible()) {
                    popupWindow.hide();
                }
            }
            scheduleNextPopup();
        }, delay);
    };

    scheduleNextPopup();
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('will-quit', () => {
    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * Re-create window on macOS when dock icon is clicked
 */
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createAdminWindow();
    }
});

// --- Data Management ---

const VOCAB_FILE = path.join(__dirname, '../src/data/a2_vocab.json');

// Helper to read words
async function readWords() {
    try {
        // In production, you might copy this to app.getPath('userData') first
        return await fs.readJson(VOCAB_FILE);
    } catch (err) {
        console.error("Error reading vocab file:", err);
        return [];
    }
}

// IPC Communications
ipcMain.handle('get-all-words', async () => {
    return await readWords();
});

ipcMain.handle('save-word', async (event, newWord) => {
    try {
        const words = await readWords();
        newWord.id = words.length > 0 ? Math.max(...words.map(w => w.id)) + 1 : 1;
        newWord.status = 'impartial'; // Default status
        newWord.reviewDate = null;
        words.push(newWord);
        await fs.writeJson(VOCAB_FILE, words, { spaces: 2 });
        return { success: true, word: newWord };
    } catch (err) {
        console.error("Error saving word:", err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-word', async (event, wordId) => {
    try {
        let words = await readWords();
        words = words.filter(w => w.id !== wordId);
        await fs.writeJson(VOCAB_FILE, words, { spaces: 2 });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('update-word', async (event, updatedWord) => {
    try {
        let words = await readWords();
        const index = words.findIndex(w => w.id === updatedWord.id);
        if (index !== -1) {
            words[index] = { ...words[index], ...updatedWord };
            await fs.writeJson(VOCAB_FILE, words, { spaces: 2 });
            return { success: true };
        }
        return { success: false, error: "Word not found" };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.on('show-popup', (event, { force } = {}) => {
    if (force || checkFocusMode()) {
        if (popupWindow) {
            popupWindow.show();
            popupWindow.webContents.send('refresh-word');
        }
    } else {
        console.log('Popup blocked by Focus Mode');
    }
});

ipcMain.on('hide-popup', () => {
    if (popupWindow) popupWindow.hide();
});

ipcMain.on('update-settings', (event, newSettings) => {
    userSettings = { ...userSettings, ...newSettings };

    // Dynamically reposition popup if position setting changed
    if (newSettings.popupPosition && popupWindow) {
        const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
        const { width: windowWidth, height: windowHeight } = popupWindow.getBounds();
        const padding = POPUP_CONFIG.SCREEN_PADDING;

        let x = screenWidth - windowWidth - padding;
        let y = screenHeight - windowHeight - padding;

        switch (newSettings.popupPosition) {
            case 'Top Left':
                x = padding;
                y = padding;
                break;
            case 'Top Right':
                x = screenWidth - windowWidth - padding;
                y = padding;
                break;
            case 'Bottom Left':
                x = padding;
                y = screenHeight - windowHeight - padding;
                break;
            case 'Bottom Right':
                x = screenWidth - windowWidth - padding;
                y = screenHeight - windowHeight - padding;
                break;
            case 'Center':
                x = (screenWidth - windowWidth) / 2;
                y = (screenHeight - windowHeight) / 2;
                break;
        }

        popupWindow.setPosition(Math.round(x), Math.round(y));
    }

    // console.log('Settings Updated:', userSettings);
});

ipcMain.on('get-settings', (event) => {
    event.reply('settings-data', userSettings);
});

ipcMain.on('admin-log', (event, arg) => {
    console.log('Admin Log:', arg);
});

// Timer is defined above in app.whenReady
// But we need to update the setInterval logic there too?
// No, the setInterval calls popupWindow.show().
// Let's modify the show() call in setInterval as well.
// Wait, setInterval logic was added in previous turn inside app.whenReady block.
// modifying the IPC handler handles the 'force' button.
// But the interval calls popupWindow.show() directly.
// I should refactor to a single showPopup helper or update the interval too.
// For now, I'll assume the user wants me to fix the logic globally.
// I will create a helper function `triggerPopup` to centralize this.

