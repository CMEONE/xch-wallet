const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { Wallet } = require("chia-client");
const wallet = new Wallet();

let win;

const createWindow = () => {
	win = new BrowserWindow({
		width: 1200,
		height: 1000,
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
	if(params.command == "logIn") {
		wallet.logIn(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "logInAndRestore") {
		wallet.logInAndRestore(params.args.fingerprint, params.args.filePath).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "logInAndSkip") {
		wallet.logInAndSkip(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getPublicKeys") {
		wallet.getPublicKeys().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});;
	} else if(params.command == "getPrivateKey") {
		wallet.getPrivateKey(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "generateMnemonic") {
		wallet.generateMnemonic().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "addKey") {
		wallet.addKey(params.args.mnemonic, params.args.type).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "deleteKey") {
		wallet.deleteKey(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "deleteAllKeys") {
		wallet.deleteAllKeys().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getSyncStatus") {
		wallet.getSyncStatus().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getHeightInfo") {
		wallet.getHeightInfo().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "farmBlock") {
		wallet.farmBlock(params.args.address).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getWallets") {
		wallet.getWallets().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getWalletBalance") {
		wallet.getWalletBalance(params.args.walletId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getTransaction") {
		wallet.getTransaction(params.args.walletId, params.args.transactionId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getTransactions") {
		wallet.getTransactions(params.args.walletId, params.args.limit).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getNextAddress") {
		wallet.getNextAddress(params.args.walletId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "sendTransaction") {
		wallet.sendTransaction(params.args.walletId, params.args.amount, params.args.address, params.args.fee).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "createBackup") {
		wallet.createBackup(params.args.filePath).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "addressToPuzzleHash") {
		wallet.addressToPuzzleHash(params.args.address).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "puzzleHashToAddress") {
		wallet.puzzleHashToAddress(params.args.puzzleHash).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else if(params.command == "getCoinInfo") {
		wallet.getCoinInfo(params.args.parentCoinInfo, params.args.puzzleHash, params.args.amount).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		});
	} else {
		win.webContents.send(`response-wallet-${params.token}`, undefined);
	}
});