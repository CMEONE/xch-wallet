const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fetch = require('node-fetch');

const { Wallet, SharedCalls, FullNode } = require("chia-client");
const wallet = new Wallet();
const connections = new SharedCalls();
const fullnode = new FullNode();

let win;

const createWindow = () => {
	win = new BrowserWindow({
		width: 1400,
		height: 1000,
		minWidth: 550,
		minHeight: 550,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		},
		title: "XCH Wallet",
		backgroundColor: "#373c46",
		icon: path.join(__dirname, 'public/XCHWallet.png')
	});
	win.loadFile(path.join(__dirname, 'src/index.html'));

	win.webContents.on('new-window', function(e, url) {
		e.preventDefault();
		shell.openExternal(url);
	});
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
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "logInAndRestore") {
		wallet.logInAndRestore(params.args.fingerprint, params.args.filePath).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "logInAndSkip") {
		wallet.logInAndSkip(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getPublicKeys") {
		wallet.getPublicKeys().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getPrivateKey") {
		wallet.getPrivateKey(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "generateMnemonic") {
		wallet.generateMnemonic().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "addKey") {
		wallet.addKey(params.args.mnemonic, params.args.type).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "deleteKey") {
		wallet.deleteKey(params.args.fingerprint).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "deleteAllKeys") {
		wallet.deleteAllKeys().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getSyncStatus") {
		wallet.getSyncStatus().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getHeightInfo") {
		wallet.getHeightInfo().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "farmBlock") {
		wallet.farmBlock(params.args.address).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getWallets") {
		wallet.getWallets().then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getWalletBalance") {
		wallet.getWalletBalance(params.args.walletId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getTransaction") {
		wallet.getTransaction(params.args.walletId, params.args.transactionId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getTransactions") {
		wallet.getTransactions(params.args.walletId, params.args.limit).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getAddress") {
		wallet.getAddress(params.args.walletId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getNextAddress") {
		wallet.getNextAddress(params.args.walletId).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "sendTransaction") {
		wallet.sendTransaction(params.args.walletId, params.args.amount, params.args.address, params.args.fee).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "sendTransactionRaw") {
		wallet.sendTransactionRaw(params.args.walletId, params.args.amount, params.args.address, params.args.fee).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "createBackup") {
		wallet.createBackup(params.args.filePath).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "addressToPuzzleHash") {
		wallet.addressToPuzzleHash(params.args.address).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "puzzleHashToAddress") {
		wallet.puzzleHashToAddress(params.args.puzzleHash).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else if(params.command == "getCoinInfo") {
		wallet.getCoinInfo(params.args.parentCoinInfo, params.args.puzzleHash, params.args.amount).then((res) => {
			win.webContents.send(`response-wallet-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-wallet-${params.token}-err`, err);
		});
	} else {
		win.webContents.send(`response-wallet-${params.token}-err`, "Command not found!");
	}
});

ipcMain.on("connections", (event, params) => {
	if(params.command == "getConnections") {
		connections.getConnections().then((res) => {
			win.webContents.send(`response-connections-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-connections-${params.token}-err`, err);
		});
	} else if(params.command == "openConnection") {
		connections.openConnection(params.args.host, params.args.port).then((res) => {
			win.webContents.send(`response-connections-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-connections-${params.token}-err`, err);
		});
	} else if(params.command == "closeConnection") {
		connections.closeConnection(params.args.nodeId).then((res) => {
			win.webContents.send(`response-connections-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-connections-${params.token}-err`, err);
		});
	} else if(params.command == "stopNode") {
		connections.stopNode().then((res) => {
			win.webContents.send(`response-connections-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-connections-${params.token}-err`, err);
		});
	} else {
		win.webContents.send(`response-connections-${params.token}-err`, "Command not found!");
	}
});

ipcMain.on("fullnode", (event, params) => {
	if(params.command == "getBlockchainState") {
		fullnode.getBlockchainState().then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getNetworkSpace") {
		fullnode.getNetworkSpace(params.args.newerBlockHeaderHash, params.args.olderBlockHeaderHash).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getBlocks") {
		fullnode.getBlocks(params.args.start, params.args.end, params.args.excludeHeaderHash).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getBlock") {
		fullnode.getBlock(params.args.headerHash).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getBlockRecordByHeight") {
		fullnode.getBlockRecordByHeight(params.args.height).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getBlockRecord") {
		fullnode.getBlockRecord(params.args.hash).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getUnfinishedBlockHeaders") {
		fullnode.getUnfinishedBlockHeaders(params.args.height).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getUnspentCoins") {
		fullnode.getUnspentCoins(params.args.puzzleHash, params.args.startHeight, params.args.endHeight).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getCoinRecordByName") {
		fullnode.getCoinRecordByName(params.args.name).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getAdditionsAndRemovals") {
		fullnode.getAdditionsAndRemovals(params.args.hash).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getNetworkInfo") {
		fullnode.getNetworkInfo().then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "addressToPuzzleHash") {
		fullnode.addressToPuzzleHash(params.args.address).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "puzzleHashToAddress") {
		fullnode.puzzleHashToAddress(params.args.puzzleHash).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else if(params.command == "getCoinInfo") {
		fullnode.getCoinInfo(params.args.parentCoinInfo, params.args.puzzleHash, params.args.amount).then((res) => {
			win.webContents.send(`response-fullnode-${params.token}`, res);
		}).catch((err) => {
			win.webContents.send(`response-fullnode-${params.token}-err`, err);
		});
	} else {
		win.webContents.send(`response-fullnode-${params.token}-err`, "Command not found!");
	}
});

let faucet_payout_coins_cache = {

}

const is_faucet_payout = (coin) => {
	return new Promise(async (resolve, reject) => {
		let timestamp = (new Date()).getTime();
		if(faucet_payout_coins_cache[coin] == null || faucet_payout_coins_cache[coin].timestamp > timestamp + (1000 * 60 * 15)) {
			fetch(`https://xchfaucet.togatech.org/api/v1/is_payout?coin=${coin}`).then((res) => {
				res.text().then((text) => {
					faucet_payout_coins_cache[coin] = {
						timestamp: (new Date()).getTime(),
						result: text == "true"
					}
					resolve(text == "true");
				}).catch((err) => {
					resolve(false);
				});
			}).catch((err) => {
				resolve(false);
			});
		} else {
			resolve(faucet_payout_coins_cache[coin].result);
		}
	});
}

ipcMain.on("is_faucet_payout", (event, params) => {
	is_faucet_payout(params.coin).then((res) => {
		win.webContents.send(`response-is_faucet_payout-${params.token}`, res);
	});
});

ipcMain.on("get_update_data", (event, params) => {
	fetch("https://xchfaucet.togatech.org/api/v1/wallet_update").then((res) => {
		res.json().then((data) => {
			win.webContents.send(`response-get_update_data-${params.token}`, data);
		}).catch((err) => {
			win.webContents.send(`response-get_update_data-${params.token}-err`, {});
		});
	}).catch((err) => {
		win.webContents.send(`response-get_update_data-${params.token}-err`, {});
	});
})