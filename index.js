const createModal = (title, description, options) => {
	document.querySelector("#modal > .modal-title").innerHTML = title;
	document.querySelector("#modal > .modal-text").innerHTML = description;
	document.querySelector("#modal > .modal-buttons").innerHTML = options.map((option) => {
		return `<button class='modal-button modal-button-${option.color}' onclick='${option.action}'>${option.text}</button>`;
	}).join("");
	document.querySelector("#overlay").style.display = "block";
	document.querySelector("#modal").style.display = "block";
}

const closeModal = () => {
	document.querySelector("#modal").style.display = "none";
	document.querySelector("#overlay").style.display = "none";
	modalOpen = false;
}

const showPrivKey = (fingerprint) => {
	wallet.getPrivateKey(fingerprint).then((privKey) => {
		createModal("Key:",
			`<b>Private Key:</b><br>
			${privKey.sk}<br>
			<br>
			<b>Public Key:</b><br>
			${privKey.pk}<br>
			<br>
			<b>Seed:</b><br>
			${privKey.seed}`, [{
				text: "Close",
				action: `closeModal()`,
				color: "green"
			}]
		);
	});
}

const confDeletePrivKey = (fingerprint) => {
	wallet.deleteKey(fingerprint).then((res) => {
		showKeys();
		closeModal();
	});
}

const deletePrivKey = (fingerprint) => {
	createModal("Confirm:",
		`Are you sure you want to delete the private key with public fingerprint ${fingerprint}? <b>This action cannot be undone!</b>`, [{
			text: "Delete",
			action: `confDeletePrivKey(${fingerprint})`,
			color: "red"
		}, {
			text: "Cancel",
			action: `closeModal()`,
			color: "gray"
		}]
	);
}

let page = "";
let key;
let keyindex;

const loginKey = (fingerprint, index) => {
	document.querySelector("#overlay").style.display = "block";
	document.querySelector("#loader > h3").innerHTML = `Logging into Wallet...`;
	document.querySelector("#loader").style.display = "block";
	wallet.logIn(fingerprint).then(async (res) => {
		if(res.success) {
			key = fingerprint;
			keyindex = index;
			let wallets = await wallet.getWallets();
			let balance = await wallet.getWalletBalance(1) || {};
			let transactions = await wallet.getTransactions(1, 100) || [];
			let connectionsList = await connections.getConnections();
			let blockchainState = await fullnode.getBlockchainState();
			console.log(wallets);
			console.log(balance);
			console.log(transactions);
			console.log(connectionsList);
			console.log(blockchainState);
			hideAll();
			document.querySelector("#menu").style.display = "block";
			switchPage("node");
		}
	});
}


const switchPage = (pageName) => {
	if(page != pageName) {
		page = pageName;
		hideAll(false);
		let menuItemsActive = document.querySelectorAll(`.menu-item-active`);
		for(let i = 0; i < menuItemsActive.length; i++) {
			menuItemsActive[i].classList.remove("menu-item-active");
		}
		document.querySelector(`#menuitem_${pageName}`).classList.add("menu-item-active");
	}
	if(pageName == "settings") {
		document.querySelector("#input_settings_keyname").value = getKeyName(key, keyindex, false);
		if(document.querySelectorAll("#terminal > code").length == 1) {
			runCommand("-h");
		}
	}
	document.querySelector(`#page_${pageName}`).style.display = "block";
}

const saveKeyName = (newKeyName) => {
	if(newKeyName == "") {
		newKeyName = null;
	}
	if(newKeyName == null || getKeyName(key, keyindex, false) != newKeyName) {
		let keySettings = getKeySettings();
		keySettings.name = newKeyName;
		setKeySettings(keySettings, key);
		document.querySelector("#input_settings_keyname").value = getKeyName(key, keyindex, false);
		createModal("Key Name Set:", 
			`<p>The name for the key with fingerprint <b>${key}</b> is now <b>${getKeyName(key, keyindex, false)}</b>.`, [{
				text: "Close",
				action: `closeModal()`,
				color: "green"
			}]
		);
	}
}

document.querySelector("#input_settings_keyname").addEventListener("keyup", function(event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		document.querySelector("#button_settings_keyname").click();
	}
});

document.querySelector("#input_settings_terminal").addEventListener("keyup", function(event) {
	if (event.keyCode === 13) {
		event.preventDefault();
		document.querySelector("#button_settings_terminal").click();
	}
});

let runningCommand = false;
let runningToken = "";

const runCommand = (command) => {
	if(command == "abort") {
		document.querySelector("#terminal").scrollTop = document.querySelector("#terminal").scrollHeight;
		runningToken = "";
		runningCommand = false;
		document.querySelector('#input_settings_terminal').value = "";
		let terminalEntries = document.querySelectorAll("#terminal > code");
		terminalEntries[terminalEntries.length - 1].innerHTML += command;
		document.querySelector("#terminal").innerHTML += `<br><code class="red"><pre>Aborted!</pre></code>`;
		document.querySelector("#terminal").innerHTML += `<code class="green"><b>chia > </b></code>`;
		document.querySelector("#terminal").scrollTop = document.querySelector("#terminal").scrollHeight;
	} else if(!runningCommand && command != null && command != "") {
		document.querySelector("#terminal").scrollTop = document.querySelector("#terminal").scrollHeight;
		runningCommand = true;
		document.querySelector('#input_settings_terminal').value = "";
		let terminalEntries = document.querySelectorAll("#terminal > code");
		terminalEntries[terminalEntries.length - 1].innerHTML += command;
		document.querySelector("#terminal").innerHTML += `<br><code></code>`;
		terminalEntries = document.querySelectorAll("#terminal > code");
		let token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
		runningToken = token;
		chia(command, key).then((res) => {
			if(token == runningToken) {
				runningToken = "";
				terminalEntries[terminalEntries.length - 1].outerHTML = `<code><pre>${res}</pre></code>`;
				document.querySelector("#terminal").innerHTML += `<code class="green"><b>chia > </b></code>`;
				document.querySelector("#terminal").scrollTop = document.querySelector("#terminal").scrollHeight;
				runningCommand = false;
			}
		}).catch((err) => {
			if(token == runningToken) {
				runningToken = "";
				terminalEntries[terminalEntries.length - 1].outerHTML = `<code><pre class="red">${err}</pre></code>`;
				document.querySelector("#terminal").innerHTML += `<code class="green"><b>chia > </b></code>`;
				document.querySelector("#terminal").scrollTop = document.querySelector("#terminal").scrollHeight;
				runningCommand = false;
			}
		});
	}
}