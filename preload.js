const cli = require('child_process').exec;
const fs = require('fs');
const { ipcRenderer, contextBridge } = require('electron');

function Wallet() {
	const sendCommand = (command, args) => {
		return new Promise(async (resolve, reject) => {
			let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
			ipcRenderer.on(`response-wallet-${token}`, (event, response) => resolve(response));
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

const hideAll = (hideMenu = true, hideLoader = true) => {
	let elements = ["#keys", "#modal", "#page_node", "#page_wallet", "#page_plots", "#page_farm", "#page_apps", "#page_settings"];
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

const getKeyName = (key, index) => {
	let keySettings = getKeySettings(key);
	if(keySettings.name == null) {
		return `Key ${index + 1} (${key})`;
	} else {
		return `${keySettings.name} (${key})`;
	}
}

const showKeys = () => {
	hideAll(true, false);
	document.querySelector("#loader > h3").innerHTML = `Connecting to Wallet...`;
	document.querySelector("#loader").style.display = "block";
	wallet.getPublicKeys().then((keys) => {
		document.querySelector("#keylist").innerHTML = keys.map((key, index) => {
			return `<div class="key-option">
				<div class="opener" onclick="loginKey(${key});">
					<p>${getKeyName(key, index)}</p>
				</div>
				<div class="options">
					<i class="fas fa-eye show-btn" onclick="showPrivKey(${key});"></i><br>
					<i class="fas fa-trash trash-btn" onclick="deletePrivKey(${key});"></i>
				</div>
			</div>`;
		}).join("");
		document.querySelector("#loader").style.display = "none";
		document.querySelector("#keys").style.display = "block";
	});
}

window.addEventListener('DOMContentLoaded', () => {
	document.querySelector("#loader > h3").innerHTML = `Starting Chia Daemon...`;
	document.querySelector("#loader").style.display = "block";
	execute(`chia init && chia start wallet`).then((res) => {
		contextBridge.exposeInMainWorld("wallet", wallet);
		contextBridge.exposeInMainWorld("hideAll", hideAll);
		contextBridge.exposeInMainWorld("showKeys", showKeys);
		contextBridge.exposeInMainWorld("getKeySettings", getKeySettings);
		contextBridge.exposeInMainWorld("setKeySettings", setKeySettings);
		showKeys();
	}).catch((err) => {
		execute(`${chia} init && ${chia} start wallet`).then((res) => {
			contextBridge.exposeInMainWorld("wallet", wallet);
			contextBridge.exposeInMainWorld("hideAll", hideAll);
			contextBridge.exposeInMainWorld("showKeys", showKeys);
			contextBridge.exposeInMainWorld("getKeySettings", getKeySettings);
			contextBridge.exposeInMainWorld("setKeySettings", setKeySettings);
			showKeys();
		}).catch((err) => {
			throw err;
		});
	})
	
});