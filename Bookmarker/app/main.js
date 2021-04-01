const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.on('ready', () => {
    console.log('Hello From Electron');
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile(`${__dirname}/index.html`)
})