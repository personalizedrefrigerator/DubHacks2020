const { ipcMain } = require('electron');

const customTitlebar = require("custom-electron-titlebar");
const path = require("path");
const url = require("url");

const loadES6 = require("esm")(module);
const { CameraFetch } = loadES6("./src/CameraFetch.mjs");
const { EmotionDetector } = loadES6("./src/EmotionDetector.js");


// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
// https://github.com/AlexTorresSk/custom-electron-titlebar/blob/master/example/preload.js
window.addEventListener("DOMContentLoaded", () =>
{
    new customTitlebar.Titlebar(
        {
            backgroundColor: new customTitlebar.Color(new customTitlebar.RGBA(100, 0, 104)),
            icon: url.format(path.join(__dirname, '/res', '/images', '/favicon.svg'))
        }
    );

    window.cv = require("./src/opencv.js");

    EmotionDetector.test();
});