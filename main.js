const { app, BrowserWindow } = require('electron');

// See https://www.electronjs.org/docs/tutorial/quick-start#create-a-basic-application

function createWindow()
{
    const win = new BrowserWindow(
    {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
        webPreferences:
        {
            nodeIntegration: true,

            // https://stackoverflow.com/questions/63427191/security-warning-in-the-console-of-browserwindow-electron-9-2-0
            // https://www.electronjs.org/docs/api/browser-window#class-browserwindow
            worldSafeExecuteJavaScript: true,
            contextIsolation: true,
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
        app.quit(); // MacOS closes the app for us. What about the BSDs?
    }
});

app.on('activate', () =>
{
    if (BrowserWindow.getAllWindows().length == 0)
    {
        createWindow();
    }
});
