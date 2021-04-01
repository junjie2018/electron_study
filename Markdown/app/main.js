const {app, BrowserWindow, dialog} = require('electron');

const fs = require('fs');

let mainWindow = null;

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform === 'darwin') {
        return false;
    }
    app.quit();
});

app.on('active', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) {
        createWindow();
    }
});

app.on('will-finish-launching', () => {
    app.on('open-file', (event, file) => {
        const win = createWindow();
        win.once('ready-to-show', () => {
            openFile(win, file);
        })
    })
});

const windows = new Set();

const createWindow = exports.createWindow = () => {

    let x, y;

    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }

    let newWindow = new BrowserWindow({
        x, y,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    newWindow.loadFile('app/index.html');

    newWindow.once('ready-to-show', () => {
        newWindow.show();
    });

    newWindow.on('closed', () => {
        windows.delete(newWindow);
        newWindow = null;
    });

    windows.add(newWindow);
    return newWindow;
};

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    const files = dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        // 过滤效果不好使了，只有放在filters第一个元素能起到过滤效果
        filters: [
            {name: 'Markdown Files', extensions: ['md']},
            {name: 'Text Files', extensions: ['txt']},
        ]
    });

    if (!files) {
        return;
    }

    // 这块代码和书上已经完全不一样了，而且Promise我非常不熟悉
    files.then(file => {
        console.log(file);
        const content = fs.readFileSync(file.filePaths[0]).toString();
        openFile(targetWindow, file.filePaths[0]);

        console.log(content);
    });

};

const saveHtml = exports.saveHtml = (targetWindow, content) => {
    const files = dialog.showSaveDialog(targetWindow, {
        title: 'Save Html',
        defaultPath: app.getPath('documents'),
        filters: [
            {name: 'HTML Files', extensions: ['html', 'htm']}
        ]
    });

    if (!files) {
        return;
    }

    files.then(file => {
        console.log(file);
        console.log(content);
        fs.writeFileSync(file.filePath, content);
    });


};

const openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file).toString();
    // 我测试，加不加这行代码，最终的效果都是一致的
    app.addRecentDocument(file);
    targetWindow.setRepresentedFilename(file);
    targetWindow.webContents.send('file-opened', file, content);
};

