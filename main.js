var app = require('electron').app;
var Window = require('electron').BrowserWindow; // jshint ignore:line
var Tray = require('electron').Tray; // jshint ignore:line
var Menu = require('electron').Menu; // jshint ignore:line
var fs = require('fs');

var server = require('./app');

var mainWindow = null;

app.on('ready', function () {
    'use strict';

    var path = require('path');
    var iconPath = path.resolve(".", './brandsmall.png');
    const appIcon = new Tray(iconPath);
    mainWindow = new Window({
        width: 1280,
        height: 960,
        autoHideMenuBar: true,
        useContentSize: true,
        resizable: true,
        icon: iconPath,
        title : "GM Forge",
        //  'node-integration': false // otherwise various client-side things may break
    });
    mainWindow.webContents.on('before-input-event', (event, input) => {
        if(input.type == "keyUp" && input.key == "F12")
        {
            mainWindow.webContents.openDevTools()
        }
        if(input.type == "keyUp" && input.key == "F5")
        {
            mainWindow.webContents.reloadIgnoringCache()
        }
    });
    appIcon.setToolTip('GM Forge');
    mainWindow.loadURL('http://localhost:30000/');
    mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    });
    mainWindow.focus();
    //require('electron').shell.openExternal("http://www.gmforge.io");
});


// shut down all parts to app after windows all closed.
app.on('window-all-closed', function () {
    'use strict';
    server.server.close();
    app.quit();
});
