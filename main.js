const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const https = require('https');

let mainWindow;
let loadingWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 650,
        minWidth: 800,
        minHeight: 600,
        maxWidth: 1000,
        maxHeight: 900,
        resizable: true,
        icon: path.join(__dirname, 'cute2.ico'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.setMenu(null);
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

function isRobloxRunning() {
    try {
        const result = execSync('tasklist', { encoding: 'utf-8' });
        return result.toLowerCase().includes('robloxplayerbeta.exe');
    } catch {
        return false;
    }
}

// Save JSON
ipcMain.handle('save-json', async (event, jsonContent) => {
    try {
        if (isRobloxRunning()) {
            return { success: false, error: 'Roblox is currently running! Please close Roblox and try again.' };
        }

        const localAppData = process.env.LOCALAPPDATA;
        const folderPath = path.join(localAppData, 'Roblox', 'ClientSettings');
        const filePath = path.join(folderPath, 'IxpSettings.json');

        fs.mkdirSync(folderPath, { recursive: true });

        if (fs.existsSync(filePath)) fs.chmodSync(filePath, 0o666);

        fs.writeFileSync(filePath, jsonContent, { encoding: 'utf-8' });

        if (process.platform === "win32") execSync(`attrib +R "${filePath}"`);

        return { success: true, path: filePath };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Read existing Roblox settings
ipcMain.handle('read-roblox-settings', async () => {
    try {
        const localAppData = process.env.LOCALAPPDATA;
        const filePath = path.join(localAppData, 'Roblox', 'ClientSettings', 'IxpSettings.json');

        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            // Check if the file is empty or only contains whitespace
            if (content.trim() === '') {
                return { success: false, error: 'Settings file is empty' };
            }
            return { success: true, content: content };
        } else {
            return { success: false, error: 'Settings file does not exist' };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// Read clipboard
ipcMain.handle('read-clipboard', async () => {
    try {
        const { clipboard } = require('electron');
        return clipboard.readText();
    } catch {
        return '';
    }
});

// Function to check for updates using GitHub API only
function checkForUpdates() {
    return new Promise((resolve, reject) => {
        // Load current app version from package.json
        const packageJsonPath = path.join(__dirname, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const currentVersion = packageJson.version;

        const options = {
            hostname: 'api.github.com',
            path: '/repos/rycoxdesu/neko-fastflags-roblox/releases/latest',
            method: 'GET',
            headers: {
                'User-Agent': 'Neko-FastFlags-App',
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const release = JSON.parse(data);
                    // Check if release and tag_name exist
                    if (!release || !release.tag_name) {
                        reject(new Error('Invalid response from GitHub API'));
                        return;
                    }

                    const latestVersion = release.tag_name.startsWith('v') ? release.tag_name.substring(1) : release.tag_name;

                    resolve({
                        updateAvailable: compareVersions(latestVersion, currentVersion) > 0,
                        currentVersion: currentVersion,
                        latestVersion: latestVersion,
                        downloadUrl: release.assets && release.assets.length > 0 ? release.assets[0].browser_download_url : null,
                        releaseNotes: release.body || ''
                    });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Helper function to compare versions
function compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 > part2) return 1;
        if (part1 < part2) return -1;
    }

    return 0;
}

// IPC handler for opening external URLs
ipcMain.handle('open-external', async (event, url) => {
    const { shell } = require('electron');
    await shell.openExternal(url);
});

// IPC handler to check for updates
ipcMain.handle('check-for-updates', async () => {
    try {
        const updateInfo = await checkForUpdates();
        if (updateInfo.updateAvailable) {
            // Return update info without showing dialog (renderer will handle modal)
            return {
                updateAvailable: updateInfo.updateAvailable,
                currentVersion: updateInfo.currentVersion,
                latestVersion: updateInfo.latestVersion,
                downloadUrl: updateInfo.downloadUrl,
                releaseNotes: updateInfo.releaseNotes || ''
            };
        } else {
            return { updateAvailable: false };
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
        return { updateAvailable: false, error: error.message };
    }
});

// Show loading popup
ipcMain.on('show-loading', () => {
    loadingWindow = new BrowserWindow({
        width: 380,
        height: 180,
        frame: false,
        resizable: false,
        parent: mainWindow,
        modal: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    loadingWindow.loadFile(path.join(__dirname, 'loading.html'));
});

// Close loading popup
ipcMain.on('close-loading', () => {
    if (loadingWindow) {
        loadingWindow.close();
        loadingWindow = null;
    }
});
