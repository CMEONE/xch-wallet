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

const updateNodeInfo = async (networkName, blockchainState, connectionsList) => {
	let synced = "Not Synced"
	let syncedColor = "red"
	let heightRaw = 0;
	let timeRaw = 0;
	let spaceRaw = 0;
	let difficultyRaw = 0;
	let vdfSubSlotIterationsRaw = 0;
	let vdfTotalIterationsRaw = 0;

	if(blockchainState != null && blockchainState.success && blockchainState.blockchain_state != null) {
		if(blockchainState.blockchain_state.sync.synced) {
			synced = "Synced";
			syncedColor = "green";
		}
		heightRaw = blockchainState.blockchain_state.peak.height;
		timeRaw = blockchainState.blockchain_state.peak.timestamp || 0;
		spaceRaw = blockchainState.blockchain_state.space || 0;
		difficultyRaw = blockchainState.blockchain_state.difficulty || 0;
		vdfSubSlotIterationsRaw = blockchainState.blockchain_state.peak.sub_slot_iters || 0;
		vdfTotalIterationsRaw = blockchainState.blockchain_state.peak.total_iters || 0;
	}

	let height = (new Number(heightRaw)).toLocaleString();
	let difficulty = (new Number(difficultyRaw)).toLocaleString();
	let vdfSubSlotIterations = (new Number(vdfSubSlotIterationsRaw)).toLocaleString();
	let vdfTotalIterations = (new Number(vdfTotalIterationsRaw)).toLocaleString();

	let prevBlockHeight = heightRaw - 1;
	while(timeRaw == 0 && prevBlockHeight != 0) {
		let prevBlock = await fullnode.getBlockRecordByHeight(prevBlockHeight);
		if(prevBlock.success) {
			timeRaw = prevBlock.block_record.timestamp || 0;
		}
		prevBlockHeight -= 1;
	}

	let time = (new Date(timeRaw * 1000)).toLocaleString();

	let space = "0 GiB";
	if(spaceRaw >= 1024 * 1024 * 1024 * 1024 * 1024 * 1024) {
		space = `${(spaceRaw / (1024 * 1024 * 1024 * 1024 * 1024 * 1024)).toFixed(3)} EiB`;
	} else if(spaceRaw >= 1024 * 1024 * 1024 * 1024 * 1024) {
		space = `${(spaceRaw / (1024 * 1024 * 1024 * 1024 * 1024)).toFixed(3)} PiB`;
	} else if(spaceRaw >= 1024 * 1024 * 1024 * 1024) {
		space = `${(spaceRaw / (1024 * 1024 * 1024 * 1024)).toFixed(3)} TiB`;
	} else if(spaceRaw >= 1024 * 1024 * 1024) {
		space = `${(spaceRaw / (1024 * 1024 * 1024)).toFixed(3)} GiB`;
	} else if(spaceRaw >= 1024 * 1024) {
		space = `${(spaceRaw / (1024 * 1024)).toFixed(3)} MiB`;
	} else if(spaceRaw >= 1024) {
		space = `${(spaceRaw / 1024).toFixed(3)} KiB`;
	} else {
		space = `${spaceRaw.toFixed(3)} B`;
	}

	let connected = "Not Connected"
	let connectedColor = "red"

	let allConnections = [];
	if(connectionsList != null && connectionsList.success && connectionsList.connections != null) {
		if(connectionsList.connections.filter(c => c.peer_host != "127.0.0.1").length > 0) {
			connected = "Connected";
			connectedColor = "green";
		}
		allConnections = connectionsList.connections;
	}

	document.querySelector("#node_title").innerHTML = `Full Node (${networkName || "mainnet"}):`;

	document.querySelector("#node_status").innerHTML = `
	<h3 class="action">Status:</h3>
	<p class="half half-margin"><b>Blockchain Status: </b> <span class="${syncedColor}">${synced}</span></p>
	<p class="half half-margin"><b>Connection Status: </b> <span class="${connectedColor}">${connected}</span></p>
	`;

	document.querySelector("#node_peak").innerHTML = `
	<h3 class="action">Peak:</h3>
	<p class="half half-margin"><b>Height: </b> ${height}</p>
	<p class="half half-margin"><b>Time: </b> ${time}</p>
	`;

	document.querySelector("#node_stats").innerHTML = `
	<h3 class="action">Stats:</h3>
	<p class="half half-margin"><b>Estimated Network Space: </b> ${space}</p>
	<p class="half half-margin"><b>Difficulty: </b> ${difficulty}</p>
	<p class="half half-margin"><b>VDF Sub Slot Iterations: </b> ${vdfSubSlotIterations}</p>
	<p class="half half-margin"><b>VDF Total Iterations: </b> ${vdfTotalIterations}</p>
	`;

	document.querySelector("#node_connections").innerHTML = `
	<h3 class="action">Connections:</h3>
	<div class="connections-table-container">
		<table class="connections-table">
			<tr>
				<th class="long"><p>Node ID</p></th>
				<th><p>IP Address</p></th>
				<th><p>Port</p></th>
				<th><p>MiB Up/Down</p></th>
				<th><p>Connection Type</p></th>
				<th><p>Height</p></th>
				<th><p>Actions</p></th>
			</tr>
			${allConnections.map((conn) => {
				const formatHeight = (h) => {
					if(h == null) {
						return "";
					} else {
						return (new Number(h)).toLocaleString();
					}
				}
				const formatType = (t) => {
					if(t == 1) {
						return "Full Node";
					} else if(t == 2) {
						return "Harvester";
					} else if(t == 3) {
						return "Farmer";
					} else if(t == 4) {
						return "Timelord";
					} else if(t == 4) {
						return "Introducer";
					} else if(t == 6) {
						return "Wallet";
					} else if(t == 7) {
						return "Plotter";
					} else {
						return "Unknown"
					}
				}
				return `
				<tr>
					<td class="long"><p>${conn.node_id}</p></td>
					<td><p>${conn.peer_host}</p></td>
					<td><p>${conn.peer_port}/${conn.peer_server_port}</p></td>
					<td><p>${(conn.bytes_written / (1024 * 1024)).toFixed(1)}/${(conn.bytes_read / (1024 * 1024)).toFixed(1)}</p></td>
					<td><p>${formatType(conn.type)}</p></td>
					<td><p>${formatHeight(conn.peak_height)}</p></td>
					<td><p><i class="fas fa-trash trash-btn" onclick="deleteNodeModal('${conn.node_id}', '${formatType(conn.type)}', '${conn.peer_host}');"></i></p></td>
				</tr>
				`;
			}).join("")}
		</table>
	</div>
	`

	setTimeout(async () => {
		if(page == "node") {
			networkName = (await fullnode.getNetworkInfo()).network_name;
			connectionsList = await connections.getConnections() || {};
			blockchainState = await fullnode.getBlockchainState() || {};
		}
		updateNodeInfo(networkName, blockchainState, connectionsList);
	}, 10000);
}

const deleteNodeModal = (nodeId, type, ip) => {
	createModal("Confirm Disconnect:", 
		`<p>Are you sure you want to disconnect from the <b>${type}</b> at <b>${ip}</b>?</p>.`, [{
			text: "Disconnect",
			action: `deleteNode("${nodeId}")`,
			color: "red"
		}, {
			text: "Cancel",
			action: `closeModal()`,
			color: "gray"
		}]
	);
}

const deleteNode = async (nodeId) => {
	await connections.closeConnection(nodeId);
	let networkName = (await fullnode.getNetworkInfo()).network_name;
	let connectionsList = await connections.getConnections() || {};
	let blockchainState = await fullnode.getBlockchainState() || {};
	closeModal();
	updateNodeInfo(networkName, blockchainState, connectionsList);
}

const loginKey = (fingerprint, index) => {
	document.querySelector("#overlay").style.display = "block";
	document.querySelector("#loader > h3").innerHTML = `Logging into Wallet...`;
	document.querySelector("#loader").style.display = "block";
	wallet.logIn(fingerprint).then(async (res) => {
		if(res.success) {
			key = fingerprint;
			keyindex = index;
			let wallets = await wallet.getWallets() || [];
			let balance = await wallet.getWalletBalance(1) || {};
			let transactions = await wallet.getTransactions(1, 100) || [];
			let connectionsList = await connections.getConnections() || {};
			let blockchainState = await fullnode.getBlockchainState() || {};
			let networkName = (await fullnode.getNetworkInfo()).network_name;
			updateNodeInfo(networkName, blockchainState, connectionsList);
			console.log(wallets);
			console.log(balance);
			console.log(transactions);
			console.log(connectionsList);
			console.log(blockchainState);
			hideAll();
			document.querySelector("#menu").style.display = "block";
			switchPage("node");
		}
	}).catch((err) => {
		setTimeout(() => {
			loginKey(fingerprint, index);
		}, 1000);
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