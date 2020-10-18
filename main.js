const { app, BrowserWindow, Menu, MenuItem } = require('electron');
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
        minWidth: 300,
        minHeight: 300,
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

// Ref: https://www.tutorialspoint.com/electron/electron_menus.htm
const MENU_TEMPLATE =
[
    {
        label: "Exit",
        click()
        {
            app.quit();
        }
    }
];

const menu = Menu.buildFromTemplate(MENU_TEMPLATE);
Menu.setApplicationMenu(menu);

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