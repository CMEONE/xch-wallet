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
		return sendCommand("getPublicKeys", []);
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

window.addEventListener('DOMContentLoaded', () => {
	execute(`${chia} init && ${chia} start wallet`).then((res) => {
		document.getElementById("loader").innerHTML = `<p>Connecting to Wallet...</p>`;
		wallet.getPublicKeys().then((keys) => {
			contextBridge.exposeInMainWorld("wallet", wallet);
			console.log(keys);
		});
	}).catch((err) => {
		throw err;
	});
});