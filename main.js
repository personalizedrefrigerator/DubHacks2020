const { app, BrowserWindow } = require('electron');
const path = require('path');

// See https://www.electronjs.org/docs/tutorial/quick-start#create-a-basic-application

function createWindow()
{
    const win = new BrowserWindow(
    {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        frame: false,
        icon: path.join(__dirname, "favicon.png"),
        webPreferences:
        {
            nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"), // See https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/example/main.js

            // https://stackoverflow.com/questions/63427191/security-warning-in-the-console-of-browserwindow-electron-9-2-0
            // https://www.electronjs.org/docs/api/browser-window#class-browserwindow
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
            enableRemoteModule: true,
        },
    });

    win.loadFile('index.html');
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () =>
{
    if (process.platform !== 'darwin')
    {
        app.quit(); // MacOS -- usually waits to quit until user presses cmd+Q
    }
});

app.on('activate', () =>
{
    if (BrowserWindow.getAllWindows().length == 0)
    {
        createWindow();
    }
});
