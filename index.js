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

const loginKey = (fingerprint) => {
	document.querySelector("#overlay").style.display = "block";
	document.querySelector("#loader > h3").innerHTML = `Logging into Wallet...`;
	document.querySelector("#loader").style.display = "block";
	wallet.logIn(fingerprint).then(async (res) => {
		if(res.success) {
			let wallets = await wallet.getWallets();
			let balance = await wallet.getWalletBalance(1) || {};
			let transactions = await wallet.getTransactions(1, 100) || [];
			console.log(wallets);
			console.log(balance);
			console.log(transactions);
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
	document.querySelector(`#page_${pageName}`).style.display = "block";
}