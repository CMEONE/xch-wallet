const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


let win;

const createWindow = () => {
	win = new BrowserWindow({
		width: 1000,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
		title: "XCH Wallet"
	});

	win.loadFile('index.html');
}

app.whenReady().then(() => {
	createWindow();
	app.on('activate', function () {
		if(BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

const { Wallet } = require("chia-client");
const wallet = new Wallet();

ipcMain.on("wallet", (event, args) => {
	if(args.command == "getPublicKeys") {
		wallet.getPublicKeys().then((keys) => {
			win.webContents.send(`response-wallet-${args.token}`, keys);
		});
	}
});