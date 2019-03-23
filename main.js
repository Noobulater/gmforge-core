var app = require('electron').app;
var Window = require('electron').BrowserWindow; // jshint ignore:line
var Tray = require('electron').Tray; // jshint ignore:line
var Menu = require('electron').Menu; // jshint ignore:line
var fs = require('fs');

var server = require('./app');
var game = require('./lib/game.js');

var mainWindow = null;

var options = server.options;
app.commandLine.appendSwitch("in-process-gpu");

let invalidateIntervalId = undefined;

process.on('uncaughtException', function (err) {
  console.log(err);
})

app.on('ready', function () {
    'use strict';

    var path = require('path');
    var iconPath = path.resolve(".", './brandsmall.png');
    const appIcon = new Tray(iconPath);
    mainWindow = new Window({
        width: options.width || 1280,
        height: options.height || 960,
        autoHideMenuBar: true,
        useContentSize: true,
        resizable: true,
        fullscreen : options.fullscreen,
        icon: iconPath,
        title : "GM Forge",
        webPreferences: {
          plugins: true,
          nativeWindowOpen : true
        },
        
        //  'node-integration': false // otherwise various client-side things may break
    });

    mainWindow.webContents.on("dom-ready", () => {
      invalidateIntervalId = setInterval(() => {
        // help the steam overlay
				try {
        	mainWindow.webContents.invalidate();
				}
				catch (err) {
					
				}
      }, 10);
    });


    appIcon.setToolTip('GM Forge');
    mainWindow.loadURL('http://127.0.0.1:'+ (options.port || 30000)+'/');
    mainWindow.webContents.on('new-window', function(e, url) {
      if (url != "about:blank") {
        e.preventDefault();
        require('electron').shell.openExternal(url);
      }
      else if (e.sender && e.WebContents && e.WebContents.BrowserWindowOptions) {
        console.log(e, url);
        e.WebContents.BrowserWindowOptions = null;
      }
    });
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type == "keyUp" && input.key == "F10") {
        mainWindow.webContents.openDevTools();
      }
      if (input.type == "keyUp" && input.key == "F5") {
        mainWindow.webContents.reloadIgnoringCache();
      }
      if (input.type == "keyUp" && input.key == "F8") {
        server.server.close();
        app.quit();
      }
    });
    mainWindow.focus();
    server.exit(function(){
			if (invalidateIntervalId !== undefined) {
				clearInterval(invalidateIntervalId);
			}
      game.saveGame("localhost", true);
      mainWindow.close();
      app.quit();
      require('ngrok').kill();
    });
    //require('electron').shell.openExternal("http://www.gmforge.io");
});


// shut down all parts to app after windows all closed.
app.on('window-all-closed', function () {
		if (invalidateIntervalId !== undefined) {
			clearInterval(invalidateIntervalId);
		}
    'use strict';
    server.server.close();
    app.quit();
		require('ngrok').kill();
});
