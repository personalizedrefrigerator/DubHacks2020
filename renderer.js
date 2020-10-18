const { ipcRenderer } = require('electron');

ipcRenderer.on('asynchronous-reply', (event, arg) =>
{
    console.log(arg);
});

ipcRenderer.send('asynchronous-message', 'loaded');