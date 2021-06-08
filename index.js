const ONE_TRILLION = 1000000000000;

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
let walletId = 1;

const formatNumber = (num, fallback = "") => {
	if(num == null) {
		return fallback || "";
	} else {
		return (new Number(num)).toLocaleString();
	}
}

const formatBalance = (bal) => {
	if(bal == null) {
		return "";
	} else {
		let fixed = (bal / ONE_TRILLION).toFixed(12);
		while(fixed[fixed.length - 1] == "0") {
			fixed = fixed.substring(0, fixed.length - 1);
		}
		if(fixed[fixed.length - 1] == ".") {
			fixed = fixed.substring(0, fixed.length - 1);
		}
		return fixed + " XCH";
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

const formatTransactionType = async (t, a, c) => {
	if(a == "xch14u4eykuc04p2egqmteqnatjjw3khktjzvn55vlqgyzjsxhj8n3tstt4rnm") {
		return "Developer Donation";
	} else if(t == 0) {
		let payout = await is_faucet_payout(c).catch((err) => {
			return "Incoming";
		});
		if(payout) {
			return "XCH Faucet";
		} else {
			return "Incoming";
		}
	} else if(t == 1) {
		return "Outgoing";
	} else {
		return "";
	}
}

const formatTime = (t) => {
	if(t == null) {
		return "";
	} else {
		return (new Date(t * 1000)).toLocaleString();
	}
}

let heightRaw = 0;

const updateNodeInfo = async (networkName, blockchainState, connectionsList) => {
	if(page == "node" && document.querySelector("#menu").style.display != "none") {
		let synced = "Not Synced"
		let syncedColor = "red"
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

		prevBlockHeight = heightRaw;
		let blocks = [];
		let unfinished = await fullnode.getUnfinishedBlockHeaders();
		if(unfinished.success) {
			for(let i = 0; i < unfinished.headers.length; i++) {
				blocks.push({
					header_hash: unfinished.headers[i].foliage.foliage_transaction_block_hash,
					timestamp: unfinished.headers[i].foliage_transaction_block.timestamp,
					is_finished_state: "Unfinished"
				});
			}
		}
		for(let i = 0; i < 10; i++) {
			let block = await fullnode.getBlockRecordByHeight(prevBlockHeight - i);
			if(block.success) {
				blocks.push({
					...block.block_record,
					is_finished_state: "Finished"
				});
			}
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
		<div class="table-container">
			<table class="table">
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
					return `
					<tr>
						<td class="long"><p>${conn.node_id}</p></td>
						<td><p>${conn.peer_host}</p></td>
						<td><p>${conn.peer_port}/${conn.peer_server_port}</p></td>
						<td><p>${(conn.bytes_written / (1024 * 1024)).toFixed(1)}/${(conn.bytes_read / (1024 * 1024)).toFixed(1)}</p></td>
						<td><p>${formatType(conn.type)}</p></td>
						<td><p>${formatNumber(conn.peak_height)}</p></td>
						<td><p><i class="fas fa-trash trash-btn" onclick="deleteNodeModal('${conn.node_id}', '${formatType(conn.type)}', '${conn.peer_host}');"></i></p></td>
					</tr>
					`;
				}).join("")}
			</table>
		</div>
		`

		document.querySelector("#node_blocks").innerHTML = `
		<h3 class="action">Blocks:</h3>
		<div class="table-container">
			<table class="table">
				<tr>
					<th class="long"><p>Header Hash</p></th>
					<th><p>Height</p></th>
					<th><p>Time Created</p></th>
					<th><p>State</p></th>
				</tr>
				${blocks.map((block) => {
					let onclickData = "";
					if(block.is_finished_state == "Finished") {
						onclickData = ` onclick="switchPage('block', ${block.height});"`
					}
					return `
					<tr${onclickData}>
						<td class="long"><p>${block.header_hash}</p></td>
						<td><p>${formatNumber(block.height)}</p></td>
						<td><p>${formatTime(block.timestamp)}</p></td>
						<td><p>${block.is_finished_state}</p></td>
					</tr>
					`;
				}).join("")}
			</table>
		</div>
		`
	}
}

const updateWalletInfo = async (wallets) => {
	if(page == "wallet" && document.querySelector("#menu").style.display != "none") {
		document.querySelector("#walletlist").innerHTML = `
		${wallets.map((w, index) => {
			let styling = ``;
			if(index == wallets.length - 1) {
				styling = ` style="margin-bottom: 0;"`;
			}
			let classes = "";
			if(w.id == walletId) {
				classes = " wallet-option-active";
			}
			return `
			<div class="wallet-option${classes}"${styling} onclick="switchWallet(${w.id});">
				<p>${w.name}</p>
			</div>
			`
		}).join("")}`;
		let syncedColor = "red";
		let synced = "Not Synced";
		let walletHeight = await wallet.getHeightInfo() || 0;
		let syncing = await wallet.getSyncStatus();
		let fullNodeState = await fullnode.getBlockchainState() || {};
		if((fullNodeState.success && fullNodeState.blockchain_state != null && fullNodeState.blockchain_state.sync.synced) && walletHeight + 10 > heightRaw) {
			syncedColor = "green";
			synced = "Synced";
		} else if(syncing) {
			syncedColor = "yellow";
			synced = "Syncing";
		}
		let balances = await wallet.getWalletBalance(walletId) || {};
		let address = await wallet.getAddress(walletId) || "";
		let txpage = transactionPage;
		let numTransactions = 10;
		let allTransactions = (await wallet.getTransactions(walletId, numTransactions + 1 + txpage * numTransactions) || []).reverse();
		let prevNext = ``;
		if(transactionPage > 0) {
			prevNext += `<button class="button" onclick="previousTransactionPage()">&lt; More Recent</button>`;
		}
		if(allTransactions.length % numTransactions == 1) {
			prevNext += `<button class="button" onclick="nextTransactionPage()">Less Recent &gt;</button>`;
		}
		allTransactions = allTransactions.slice(txpage * numTransactions, numTransactions + txpage * numTransactions);
		document.querySelector("#wallet_status").innerHTML = `
		<h3 class="action">Status:</h3>
		<p class="half half-margin"><b>Sync Status: </b> <span class="${syncedColor}">${synced}</span></p>
		<p class="half half-margin"><b>Height: </b> ${formatNumber(walletHeight)}</p>
		`;
		document.querySelector("#wallet_balance").innerHTML = `
		<h3 class="action">Balance:</h3>
		<p class="one-third half-margin"><b>Total Balance:</b></p><p class="two-thirds half-margin right-align">${formatBalance(balances.confirmed_wallet_balance)}</p>
		<p class="one-third half-margin"><b>Spendable Balance:</b></p><p class="two-thirds half-margin right-align">${formatBalance(balances.spendable_balance)}</p>
		<p class="one-third half-margin"><b>Pending Total Balance:</b></p><p class="two-thirds half-margin right-align">${formatBalance(balances.unconfirmed_wallet_balance)}</p>
		<p class="one-third half-margin"><b>Pending Amount:</b></p><p class="two-thirds half-margin right-align">${formatBalance(balances.unconfirmed_wallet_balance - balances.confirmed_wallet_balance)}</p>
		<p class="one-third half-margin"><b>Pending Change:</b></p><p class="two-thirds half-margin right-align">${formatBalance(balances.pending_change)}</p>
		<p class="half-margin">&nbsp;</p>
		<div class="left-container">
			<p class="button background-white" style="display: inline-block; vertical-align: bottom;"><a href="https://xchfaucet.togatech.org" target="_blank">XCH Faucet</a></p>
			<button class="button" style="margin-right: 0;" onclick="donateInfo();">Donate</button>
		</div>
		`;
		document.querySelector("#wallet_receive").innerHTML = `
		<h3 class="action">Receive:</h3>
		<p><b id="wallet_address">${address}</b></p>
		<div class="left-container">
			<button class="button background-white" onclick="copyAddress();">Copy</button>
			<button class="button" style="margin-right: 0;" onclick="newAddress();">New Address</button>
		</div>
		`
		for(let i = 0; i < allTransactions.length; i++) {
			allTransactions[i].transactionType = await formatTransactionType(allTransactions[i].type, allTransactions[i].to_address, allTransactions[i].name);
		}
		document.querySelector("#wallet_history").innerHTML = `
		<h3 class="action">History:</h3>
		<div class="table-container">
		<table class="table">
			<tr>
				<th><p>Type</p></th>
				<th class="long"><p>To</p></th>
				<th><p>Amount</p></th>
				<th><p>Fee</p></th>
				<th><p>Height</p></th>
				<th><p>Timestamp</p></th>
			</tr>
			${allTransactions.map((transaction) => {
				if(transaction.confirmed_at_height == 0) {
					transaction.confirmed_at_height = null;
				}
				return `
				<tr>
					<td><p>${transaction.transactionType}</p></td>
					<td class="long"><p>${transaction.to_address}</p></td>
					<td><p>${formatBalance(transaction.amount)}</p></td>
					<td><p>${formatBalance(transaction.fee_amount)}</p></td>
					<td><p>${formatNumber(transaction.confirmed_at_height, "Unconfirmed")}</p></td>
					<td><p>${formatTime(transaction.created_at_time)}</p></td>
				</tr>
				`;
			}).join("")}
		</table>
		<div class="center-container">${prevNext}</div>
		`;
	}
}

const donateInfo = () => {
	createModal("Developer Donation:", 
		`<p>Thanks so much for considering a donation! These donations are the only way we can continue to develop and maintain XCH Wallet. To donate, please send 0 XCH to your receive address and add your donation amount in the Developer Donation input field.</p>`, [{
			text: "Add Donation",
			action: `closeModal()`,
			color: "green"
		}]
	);
}

const sendPaymentModal = () => {
	let address = document.querySelector("#input_wallet_address").value || "";
	if(address.startsWith("0x")) {
		try {
			address = puzzle_hash_to_address(address);
		} catch(err) {

		}
	}
	let amount = parseInt((document.querySelector("#input_wallet_amount").value || 0) * ONE_TRILLION);
	let fee = parseInt((document.querySelector("#input_wallet_fee").value || 0) * ONE_TRILLION);
	let donation = parseInt((document.querySelector("#input_wallet_donation").value || 0) * ONE_TRILLION);
	if(donation == 0) {
		createModal("Developer Donation:", 
			`<p>Your transaction does not contain a developer donation. While optional, these donations are the only way we can continue to develop and maintain XCH Wallet. Please consider adding a small amount as a donation in the developer donation input field. Thanks so much!</p>`, [{
				text: "Send Anyway",
				action: `sendPayment("${address}", ${amount}, ${fee}, ${donation})`,
				color: "gray"
			}, {
				text: "Add Donation",
				action: `closeModal()`,
				color: "green"
			}]
		);
	} else {
		sendPayment(address, amount, fee, donation);
	}
}

const rotateDeveloperDonation = async (id, donation, address, fee) => {
	let balances = await wallet.getWalletBalance(id) || {};
	let pending = balances.unconfirmed_wallet_balance || 0;
	if(pending >= donation) {
		wallet.sendTransactionRaw(id, donation, address, fee).then(() => {
			if(!res.success) {
				setTimeout(() => {
					rotateDeveloperPayment(id, donation, address, fee);
				}, 1000);
			}
		}).catch((err) => {
			setTimeout(() => {
				rotateDeveloperPayment(id, donation, address, fee);
			}, 1000);
		});
	}
}

const sendPayment = (address, amount, fee, donation) => {
	closeModal();
	wallet.sendTransactionRaw(walletId, amount, address, fee).then((res) => {
		console.log(res);
		if(res.success) {
			document.querySelector("#input_wallet_address").value = "";
			document.querySelector("#input_wallet_amount").value = "";
			document.querySelector("#input_wallet_fee").value = "";
			document.querySelector("#input_wallet_donation").value = "";
			document.querySelector("#wallet_send_status").innerHTML = `<p class="green">Transaction has successfully been sent to a full node and included in the mempool.</p>`;	
		
			rotateDeveloperDonation(walletId, donation, "xch14u4eykuc04p2egqmteqnatjjw3khktjzvn55vlqgyzjsxhj8n3tstt4rnm", 0);
		} else {
			document.querySelector("#wallet_send_status").innerHTML = `<p class="red">${res.error}</p>`;
		}
	}).catch((err) => {
		console.log(err);
	});
}

let transactionPage = 0;

const nextTransactionPage = async () => {
	transactionPage++;
	updateWalletInfo(await wallet.getWallets() || []);
}

const previousTransactionPage = async () => {
	transactionPage--;
	updateWalletInfo(await wallet.getWallets() || []);
}

const newAddress = async () => {
	await wallet.getNextAddress(walletId);
	updateWalletInfo(await wallet.getWallets() || []);
}

const copyAddress = async () => {
	copy(document.querySelector('#wallet_address').innerHTML);
	createModal("Copied:", 
		`<p>Your address has been copied to your clipboard.</p>`, [{
			text: "Close",
			action: `closeModal()`,
			color: "gray"
		}]
	);
}

const switchWallet = async (w) => {
	walletId = w;
	updateWalletInfo(await wallet.getWallets() || []);
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

let nodeInterval;
let walletInterval;

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
			let networkName = (await fullnode.getNetworkInfo() || {}).network_name || "mainnet";
			if(nodeInterval == null) {
				nodeInterval = setInterval(async () => {
					if(page == "node" && document.querySelector("#menu").style.display != "none") {
						let networkName = (await fullnode.getNetworkInfo() || {}).network_name || "mainnet";
						let connectionsList = await connections.getConnections() || {};
						let blockchainState = await fullnode.getBlockchainState() || {};
						updateNodeInfo(networkName, blockchainState, connectionsList);
					}
				}, 10000);
			}
			if(walletInterval == null) {
				walletInterval = setInterval(async () => {
					if(page == "wallet" && document.querySelector("#menu").style.display != "none") {
						let wallets = await wallet.getWallets() || [];
						updateWalletInfo(wallets);
					}
				}, 10000);
			}
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

const showBlockInfo = async (height) => {
	document.querySelector("#block_title").innerHTML = `Block ${(new Number(height)).toLocaleString()}:`;
	document.querySelector("#block_info").innerHTML = ``;
	let block = await fullnode.getBlockRecordByHeight(height);
	if(block.success) {
		let record = block.block_record;
		let blockPreData = await fullnode.getBlock(record.header_hash);
		if(blockPreData.success) {
			let blockData = blockPreData.block;
			let additions = [];
			let removals = [];
			let additionsAmount = 0;
			let removalsAmount = 0;
			let additionsAndRemovals = await fullnode.getAdditionsAndRemovals(record.header_hash);
			if(additionsAndRemovals.success) {
				additions = additionsAndRemovals.additions;
				removals = additionsAndRemovals.removals;
			}
			for(let i = 0; i < additions.length; i++) {
				additionsAmount += additions[i].coin.amount;
			}
			for(let i = 0; i < removals.length; i++) {
				removalsAmount += removals[i].coin.amount;
			}
			let prevNext = ``;
			if(height > 0) {
				prevNext += `<button class="button" onclick="showBlockInfo(${height - 1})">&lt; Previous Block</button>`;
			}
			if(height < heightRaw) {
				prevNext += `<button class="button" onclick="showBlockInfo(${height + 1})">Next Block &gt;</button>`;
			}
			document.querySelector("#block_info").innerHTML = `
			<h3 class="action">Block Info:</h3>
			<p class="one-fourth"><b>Header Hash:</b></p>
			<p class="three-fourths right-align">${record.header_hash}</p>
			<hr>
			<p class="one-fourth"><b>Timestamp:</b></p>
			<p class="three-fourths right-align">${formatTime(record.timestamp)}</p>
			<hr>
			<p class="one-fourth"><b>Height:</b></p>
			<p class="three-fourths right-align">${formatNumber(record.height)}</p>
			<hr>
			<p class="one-fourth"><b>Weight:</b></p>
			<p class="three-fourths right-align">${formatNumber(record.weight)}</p>
			<hr>
			<p class="one-fourth"><b>Previous Header Hash:</b></p>
			<p class="three-fourths right-align">${record.prev_hash}</p>
			<hr>
			<p class="one-fourth"><b>Total VDF Iterations:</b></p>
			<p class="three-fourths right-align">${formatNumber(record.total_iters)}</p>
			<hr>
			<p class="one-fourth"><b>Block VDF Iterations:</b></p>
			<p class="three-fourths right-align">${formatNumber(blockData.reward_chain_block.challenge_chain_ip_vdf.number_of_iterations)}</p>
			<hr>
			<p class="one-fourth"><b>Proof of Space Size:</b></p>
			<p class="three-fourths right-align">${formatNumber(blockData.reward_chain_block.proof_of_space.size)}</p>
			<hr>
			<p class="one-fourth"><b>Plot Public Key:</b></p>
			<p class="three-fourths right-align">${blockData.reward_chain_block.proof_of_space.plot_public_key}</p>
			<hr>
			<p class="one-fourth"><b>Pool Public Key:</b></p>
			<p class="three-fourths right-align">${blockData.reward_chain_block.proof_of_space.pool_public_key}</p>
			<hr>
			<p class="one-fourth"><b>Farmer Puzzle Hash:</b></p>
			<p class="three-fourths right-align">${record.farmer_puzzle_hash}</p>
			<hr>
			<p class="one-fourth"><b>Pool Puzzle Hash:</b></p>
			<p class="three-fourths right-align">${record.pool_puzzle_hash}</p>
			<hr>
			<p class="one-fourth"><b>Farmer Address:</b></p>
			<p class="three-fourths right-align">${puzzle_hash_to_address(record.farmer_puzzle_hash)}</p>
			<hr>
			<p class="one-fourth"><b>Pool Address:</b></p>
			<p class="three-fourths right-align">${puzzle_hash_to_address(record.pool_puzzle_hash)}</p>
			<hr>
			<p class="one-fourth"><b>Transactions Filter Hash:</b></p>
			<p class="three-fourths right-align">${(blockData.foliage_transaction_block || {}).filter_hash || ""}</p>
			<hr>
			<p class="one-fourth"><b>Number of Additions:</b></p>
			<p class="three-fourths right-align">${additions.length}</p>
			<hr>
			<p class="one-fourth"><b>Total Additions Amount:</b></p>
			<p class="three-fourths right-align">${formatBalance(additionsAmount)}</p>
			<hr>
			<p class="one-fourth"><b>Number of Removals:</b></p>
			<p class="three-fourths right-align">${removals.length}</p>
			<hr>
			<p class="one-fourth"><b>Total Removals Amount:</b></p>
			<p class="three-fourths right-align">${formatBalance(removalsAmount)}</p>
			<hr>
			<p class="one-fourth"><b>Fees Amount:</b></p>
			<p class="three-fourths right-align">${formatBalance(record.fees)}</p>
			<hr>
			<div class="center-container">${prevNext}</div>
			`;
		} else {
			document.querySelector("#block_info").innerHTML = `
			<h3 class="action">Block Info:</h3>
			<p>Unable to find block!</p>
			`;
		}
	} else {
		document.querySelector("#block_info").innerHTML = `
		<h3 class="action">Block Info:</h3>
		<p>Unable to find block!</p>
		`;

	}
}


const switchPage = async (pageName, data) => {
	if(page != pageName) {
		page = pageName;
		hideAll(false);
		let menuItemsActive = document.querySelectorAll(`.menu-item-active`);
		for(let i = 0; i < menuItemsActive.length; i++) {
			menuItemsActive[i].classList.remove("menu-item-active");
		}
		if(document.querySelector(`#menuitem_${pageName}`) != null) {
			document.querySelector(`#menuitem_${pageName}`).classList.add("menu-item-active");
		}
	}
	if(pageName == "node") {
		let networkName = (await fullnode.getNetworkInfo() || {}).network_name || "mainnet";
		let connectionsList = await connections.getConnections() || {};
		let blockchainState = await fullnode.getBlockchainState() || {};
		updateNodeInfo(networkName, blockchainState, connectionsList);
	} else if(pageName == "wallet") {
		let wallets = await wallet.getWallets() || [];
		updateWalletInfo(wallets);
	} else if(pageName == "block") {
		await showBlockInfo(data);
	} else if(pageName == "settings") {
		document.querySelector("#input_settings_keyname").value = getKeyName(key, keyindex, false);
		if(document.querySelectorAll("#terminal > code").length == 1) {
			runCommand("-h");
		}
	}
	hideAll(false);
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