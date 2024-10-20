const { app, BrowserWindow } = require('electron');

require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/node_modules/electron`)
});





function createWindow () {
  const mainWindow = new BrowserWindow({
    resizable: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadFile('MainWindow/MainWindow.html');
  mainWindow.setMenu(null);
  mainWindow.maximize();
  mainWindow.setMinimumSize(1000, 800);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});