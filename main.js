const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { Wallet } = require("chia-client");
const wallet = new Wallet();

let win;

const createWindow = () => {
	win = new BrowserWindow({
		width: 1000,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
		title: "XCH Wallet",
		backgroundColor: "#373c46"
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


ipcMain.on("wallet", (event, params) => {
	if(params.command == "getPublicKeys") {
		wallet.getPublicKeys().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getPrivateKey") {
		wallet.getPrivateKey(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		})
	} else if(params.command == "deleteKey") {
		wallet.deleteKey(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		})
	} else if(params.command == "logIn") {
		wallet.logIn(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		})
	} else {
		win.webContents.send(`response-wallet-${params.token}`, undefined);
	}
});