const cli = require('child_process').exec;
const fs = require('fs');
const { ipcRenderer, contextBridge, clipboard } = require('electron');
const { puzzle_hash_to_address, address_to_puzzle_hash } = require("chia-utils");

function Wallet() {
	const sendCommand = (command, args) => {
		return new Promise(async (resolve, reject) => {
			let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
			ipcRenderer.on(`response-wallet-${token}`, (event, response) => resolve(response));
			ipcRenderer.on(`response-wallet-${token}-err`, (event, response) => reject(response));
			ipcRenderer.send("wallet", {
				command,
				args,
				token
			});
		});
	}

	this.logIn = (fingerprint) => {
		return sendCommand("logIn", {
			fingerprint
		});
	}

	this.logInAndRestore = (fingerprint, filePath) => {
		return sendCommand("logInAndRestore", {
			fingerprint,
			filePath
		});
	}

	this.logInAndSkip = (fingerprint) => {
		return sendCommand("logInAndSkip", {
			fingerprint
		});
	}

	this.getPublicKeys = () => {
		return sendCommand("getPublicKeys", {});
	}

	this.getPrivateKey = (fingerprint) => {
		return sendCommand("getPrivateKey", {
			fingerprint
		});
	}

	this.generateMnemonic = () => {
		return sendCommand("generateMnemonic", {});
	}

	this.addKey = (mnemonic, type = "new_wallet") => {
		return sendCommand("addKey", {
			mnemonic,
			type
		});
	}

	this.deleteKey = (fingerprint) => {
		return sendCommand("deleteKey", {
			fingerprint
		});
	}

	this.deleteAllKeys = () => {
		return sendCommand("deleteAllKeys", {});
	}

	this.getSyncStatus = () => {
		return sendCommand("getSyncStatus", {});
	}

	this.getHeightInfo = () => {
		return sendCommand("getHeightInfo", {});
	}

	this.farmBlock = (address) => {
		return sendCommand("farmBlock", {
			address
		});
	}

	this.getWallets = () => {
		return sendCommand("getWallets", {});
	}

	this.getWalletBalance = (walletId) => {
		return sendCommand("getWalletBalance", {
			walletId
		});
	}

	this.getTransaction = (walletId, transactionId) => {
		return sendCommand("getTransaction", {
			walletId,
			transactionId
		});
	}

	this.getTransactions = (walletId, limit) => {
		return sendCommand("getTransactions", {
			walletId,
			limit
		});
	}

	this.getAddress = (walletId) => {
		return sendCommand("getAddress", {
			walletId
		});
	}

	this.getNextAddress = (walletId) => {
		return sendCommand("getNextAddress", {
			walletId
		});
	}

	this.sendTransaction = (walletId, amount, address, fee) => {
		return sendCommand("sendTransaction", {
			walletId,
			amount,
			address,
			fee
		});
	}

	this.createBackup = (filePath) => {
		return sendCommand("createBackup", {
			filePath
		});
	}

	this.addressToPuzzleHash = (address) => {
		return sendCommand("addressToPuzzleHash", {
			address
		});
	}

	this.puzzleHashToAddress = (puzzleHash) => {
		return sendCommand("puzzleHashToAddress", {
			puzzleHash
		});
	}

	this.getCoinInfo = (parentCoinInfo, puzzleHash, amount) => {
		return sendCommand("getCoinInfo", {
			parentCoinInfo,
			puzzleHash,
			amount
		});
	}
}

function Connections() {
	const sendCommand = (command, args) => {
		return new Promise(async (resolve, reject) => {
			let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
			ipcRenderer.on(`response-connections-${token}`, (event, response) => resolve(response));
			ipcRenderer.on(`response-connections-${token}-err`, (event, response) => reject(response));
			ipcRenderer.send("connections", {
				command,
				args,
				token
			});
		});
	}

	this.getConnections = () => {
		return sendCommand("getConnections", {});
	}

	this.openConnection = (host, port) => {
		return sendCommand("openConnection", {
			host,
			port
		});
	}

	this.closeConnection = (nodeId) => {
		return sendCommand("closeConnection", {
			nodeId
		});
	}

	this.stopNode = () => {
		return sendCommand("stopNode", {});
	}
}

function FullNode() {
	const sendCommand = (command, args) => {
		return new Promise(async (resolve, reject) => {
			let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
			ipcRenderer.on(`response-fullnode-${token}`, (event, response) => resolve(response));
			ipcRenderer.on(`response-fullnode-${token}-err`, (event, response) => reject(response));
			ipcRenderer.send("fullnode", {
				command,
				args,
				token
			});
		});
	}

	this.getBlockchainState = () => {
		return sendCommand("getBlockchainState", {});
	}

	this.getNetworkSpace = (newerBlockHeaderHash, olderBlockHeaderHash) => {
		return sendCommand("getNetworkSpace", {
			newerBlockHeaderHash,
			olderBlockHeaderHash
		});
	}

	this.getBlocks = (start, end, excludeHeaderHash) => {
		return sendCommand("getBlocks", {
			start,
			end,
			excludeHeaderHash
		});
	}

	this.getBlock = (headerHash) => {
		return sendCommand("getBlock", {
			headerHash
		});
	}

	this.getBlockRecordByHeight = (height) => {
		return sendCommand("getBlockRecordByHeight", {
			height
		});
	}

	this.getBlockRecord = (hash) => {
		return sendCommand("getBlockRecord", {
			hash
		});
	}

	this.getUnfinishedBlockHeaders = (height) => {
		return sendCommand("getUnfinishedBlockHeaders", {
			height
		});
	}

	this.getUnspentCoins = (puzzleHash, startHeight, endHeight) => {
		return sendCommand("getUnspentCoins", {
			puzzleHash,
			startHeight,
			endHeight
		});
	}

	this.getCoinRecordByName = (name) => {
		return sendCommand("getCoinRecordByName", {
			name
		});
	}

	this.getAdditionsAndRemovals = (hash) => {
		return sendCommand("getAdditionsAndRemovals", {
			hash
		});
	}

	this.getNetworkInfo = () => {
		return sendCommand("getNetworkInfo", {});
	}

	this.addressToPuzzleHash = (address) => {
		return sendCommand("addressToPuzzleHash", {
			address
		});
	}

	this.puzzleHashToAddress = (puzzleHash) => {
		return sendCommand("puzzleHashToAddress", {
			puzzleHash
		});
	}

	this.getCoinInfo = (parentCoinInfo, puzzleHash, amount) => {
		return sendCommand("getCoinInfo", {
			parentCoinInfo,
			puzzleHash,
			amount
		});
	}
}

const execute = (command) => {
	return new Promise(async (resolve, reject) => {
		cli(command, (error, stdout, stderr) => {
	    	if(stderr != "") {
	    		reject(stderr);
	    	} else {
		        resolve(stdout);
		    }
	    });
	});
};

let chia = "chia";
if(process.platform === 'darwin') {
	chia = "/Applications/Chia.app/Contents/Resources/app.asar.unpacked/daemon/chia";
} else if(process.platform === "win32") {
	chia = "~\\AppData\\Local\\chia-blockchain\\" + fs.readdirSync("~\\AppData\\Local\\chia-blockchain\\").filter(f => f.startsWith("app-")).sort().reverse()[0] + "\\resources\\app.asar.unpacked\\daemon\\chia.exe";
} else if(process.platform === "linux") {
	chia = "/usr/lib/chia-blockchain/resources/app.asar.unpacked/daemon/chia";
}

const wallet = new Wallet();
const connections = new Connections();
const fullnode = new FullNode();

const hideAll = (hideMenu = true, hideLoader = true) => {
	let elements = ["#keys", "#modal", "#page_node", "#page_block", "#page_wallet", "#page_plots", "#page_farm", "#page_apps", "#page_settings"];
	for(let i = 0; i < elements.length; i++) {
		document.querySelector(`${elements[i]}`).style.display = "none";
	}
	if(hideMenu) {
		document.querySelector("#menu").style.display = "none";
	}
	if(hideLoader) {
		document.querySelector("#overlay").style.display = "none";
		document.querySelector("#loader").style.display = "none";
	}
}

const getKeySettings = (key = null) => {
	if(key == null) {
		let items = Object.keys(localStorage);
		let settings = {}; 
		for(let i = 0; i < items.length; i++) {
			if(items[i].startsWith("keyprefs-")) {
				let parsed = {};
				try {
					parsed = JSON.parse(localStorage.getItem(items[i]));
				} catch(err) {
					localStorage.setItem(items[i], JSON.stringify({}));
				}
				settings[parseInt(items[i].replace("keyprefs-", ""))] = parsed;
			}
		}
		return settings;
	} else {
		if(localStorage.getItem(`keyprefs-${key}`) == null) {
			localStorage.setItem(`keyprefs-${key}`, JSON.stringify({}));
		}
		let parsed = {};
		try {
			parsed = JSON.parse(localStorage.getItem(`keyprefs-${key}`));
		} catch(err) {
			localStorage.setItem(`keyprefs-${key}`, JSON.stringify({}));
		}
		return parsed;
	}
}

const setKeySettings = (value, key = null) => {
	if(key == null) {
		let items = Object.keys(value);
		for(let i = 0; i < items.length; i++) {
			localStorage.setItem(`keyprefs-${items[i]}`, JSON.stringify(value[items[i]]));
		}
	} else {
		localStorage.setItem(`keyprefs-${key}`, JSON.stringify(value));
	}
}

const getKeyName = (key, index, includeFingerprint = true) => {
	if(key != null && parseInt(key) != NaN) {
		let keySettings = getKeySettings(key);
		let addition = "";
		if(includeFingerprint) {
			addition = ` (${key})`;
		}
		if(keySettings.name == null) {
			return `Key ${index + 1}${addition}`;
		} else {
			return `${keySettings.name}${addition}`;
		}
	} else {
		return "Key";
	}
}

const expose = () => {
	contextBridge.exposeInMainWorld("wallet", wallet);
	contextBridge.exposeInMainWorld("connections", connections);
	contextBridge.exposeInMainWorld("fullnode", fullnode);
	contextBridge.exposeInMainWorld("hideAll", hideAll);
	contextBridge.exposeInMainWorld("showKeys", showKeys);
	contextBridge.exposeInMainWorld("getKeySettings", getKeySettings);
	contextBridge.exposeInMainWorld("setKeySettings", setKeySettings);
	contextBridge.exposeInMainWorld("getKeyName", getKeyName);
	contextBridge.exposeInMainWorld("chia", runChiaCommand);
	contextBridge.exposeInMainWorld("puzzle_hash_to_address", puzzle_hash_to_address);
	contextBridge.exposeInMainWorld("address_to_puzzle_hash", address_to_puzzle_hash);
	contextBridge.exposeInMainWorld("copy", clipboard.writeText);
}

const showKeys = () => {
	hideAll(true, false);
	document.querySelector("#loader > h3").innerHTML = `Connecting to Wallet...`;
	document.querySelector("#loader").style.display = "block";
	document.querySelector("#terminal").innerHTML = `<code class="green"><b>chia > </b></code>`;
	wallet.getPublicKeys().then((keys) => {
		document.querySelector("#keylist").innerHTML = keys.map((key, index) => {
			return `<div class="key-option">
				<div class="opener" onclick="loginKey(${key}, ${index});">
					<p>${getKeyName(key, index, true)}</p>
				</div>
				<div class="options">
					<i class="fas fa-eye show-btn" onclick="showPrivKey(${key});"></i><br>
					<i class="fas fa-trash trash-btn" onclick="deletePrivKey(${key});"></i>
				</div>
			</div>`;
		}).join("");
		document.querySelector("#loader").style.display = "none";
		document.querySelector("#keys").style.display = "block";
	}).catch((err) => {
		setTimeout(() => {
			showKeys();
		}, 1000);
	});
}

const runChiaCommand = (command, fingerprint = null) => {
	return new Promise(async (resolve, reject) => {
		let resolved = false;
		command = command.replaceAll(";", "").replaceAll("&", "").replaceAll("&", "");
		if(command.startsWith("chia ")) {
			command = command.substring(5);
		}
		if(!command.includes(" -f ") && !command.includes(" --fingerprint ") && fingerprint != null) {
			runChiaCommand(command + " --fingerprint " + fingerprint, null).then((res) => {
				if(!resolved) {
					resolved = true;
					resolve(res);
				}
			}).catch((err1) => {
				runChiaCommand(command, null).then((res) => {
					if(!resolved) {
						resolved = true;
						resolve(res);
					}
				}).catch((err2) => {
					if(!resolved) {
						resolved = true;
						if(err2.includes("Error: Missing option '--fingerprint' / '-f'")) {
							reject(err1);
						} else {
							reject(err2);
						}
					}
				})
			})
		} else {
			execute(`chia ${command}`).then((res) => {
				if(!resolved) {
					resolved = true;
					resolve(res);
				}
			}).catch((err1) => {
				execute(`${chia} ${command}`).then((res) => {
					if(!resolved) {
						resolved = true;
						resolve(res);
					}
				}).catch((err2) => {
					if(!resolved) {
						resolved = true;
						reject(err2);
					}
				});
			});
		}
		setTimeout(() => {
			if(!resolved) {
				resolved = true;
				reject(
`Command timed out!

It is possible that this command returned a prompt for a complex interaction,
which is not supported by the XCH Wallet Terminal. Please try the command again
using the command parameters instead (use the \`-h\` option to view the parameters).`
);
			}
		}, 60000);
	});
}

window.addEventListener('DOMContentLoaded', () => {
	document.querySelector("#loader > h3").innerHTML = `Starting Chia Daemon...`;
	document.querySelector("#loader").style.display = "block";
	execute(`chia init && chia start wallet`).then((res) => {
		expose();
		showKeys();
	}).catch((err) => {
		execute(`${chia} init && ${chia} start wallet`).then((res) => {
			expose();
			showKeys();
		}).catch((err) => {
			throw err;
		});
	});
	
});