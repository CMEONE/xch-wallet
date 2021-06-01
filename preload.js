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

	this.getPublicKeys = () => {
		return sendCommand("getPublicKeys", {});
	}

	this.getPrivateKey = (fingerprint) => {
		return sendCommand("getPrivateKey", {
			fingerprint
		});
	}

	this.deleteKey = (fingerprint) => {
		return sendCommand("deleteKey", {
			fingerprint
		});
	}

	this.logIn = (fingerprint) => {
		return sendCommand("logIn", {
			fingerprint
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
	chia = fs.readdirSync("~\\AppData\\Local\\chia-blockchain\\").filter(f => f.startsWith("app-"))[0] + "\\resources\\app.asar.unpacked\\daemon\\chia.exe";
} else if(process.platform === "linux") {
	chia = "/usr/lib/chia-blockchain/resources/app.asar.unpacked/daemon/chia";
}

const wallet = new Wallet();

const showKeys = () => {
	wallet.getPublicKeys().then((keys) => {
		document.querySelector("#keylist").innerHTML = keys.map((key) => {
			return `<div class="key-option">
				<div class="opener" onclick="loginKey(${key});">
					<p>${key}</p>
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
	execute(`${chia} init && ${chia} start wallet`).then((res) => {
		document.querySelector("#loader > h3").innerHTML = `Connecting to Wallet...`;
		contextBridge.exposeInMainWorld("showKeys", showKeys);
		contextBridge.exposeInMainWorld("wallet", wallet);
		showKeys();
	}).catch((err) => {
		throw err;
	});
});