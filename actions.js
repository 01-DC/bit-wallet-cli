const bip39 = require("bip39")
const bitcoin = require("bitcoinjs-lib")
const hdkey = require("hdkey")
const axios = require("axios")

const createWallet = async (db) => {
	const mnemonic = bip39.generateMnemonic()
	const seed = await bip39.mnemonicToSeed(mnemonic)
	const root = hdkey.fromMasterSeed(seed, bitcoin.networks.testnet)
	const addrNode = root.derive("m/44'/1'/0'/0/0") // m/44'/0'/0'/0/0 for mainnet
	const address = bitcoin.payments.p2pkh({
		pubkey: addrNode.publicKey,
		network: bitcoin.networks.testnet,
	}).address
	await db.run(
		"INSERT INTO wallets (mnemonic, address) VALUES (?, ?)",
		[mnemonic, address],
		function (err) {
			if (err) console.log(err)
			else {
				console.log(`New Wallet created with ID: ${this.lastID}`)
			}
		}
	)
	console.log(`New Wallet's First Address: ${address}`)
	console.log(`Mnemonic: ${mnemonic}`)
}

const importWallet = async (db, mnemonic) => {
	if (!bip39.validateMnemonic(mnemonic)) {
		console.log("Invalid mnemonic!")
		return
	}
	const seed = await bip39.mnemonicToSeed(mnemonic)
	const root = hdkey.fromMasterSeed(seed, bitcoin.networks.testnet)
	const addrNode = root.derive("m/44'/1'/0'/0/0") // m/44'/0'/0'/0/0 for mainnet
	const address = bitcoin.payments.p2pkh({
		pubkey: addrNode.publicKey,
		network: bitcoin.networks.testnet,
	}).address
	await db.run(
		"INSERT INTO wallets (mnemonic, address) VALUES (?, ?)",
		[mnemonic, address],
		function (err) {
			if (err) console.log(err)
			else {
				console.log(`New Wallet imported with ID: ${this.lastID}`)
			}
		}
	)
	console.log(`Imported Wallet Address: ${address}`)
}

const listWallets = async (db) => {
	db.all("SELECT * FROM wallets", [], (err, rows) => {
		if (err) console.log(err)
		else console.log(rows)
	})
}

const getBalance = async (address) => {
	try {
		const response = await axios.get(
			`https://api.blockcypher.com/v1/btc/test3/addrs/${address}/balance`
		)
		const balance = response.data.balance / 100000000
		console.log(`Balance of address ${address}: ${balance} BTC`)
	} catch (err) {
		console.error(`Error retrieving balance for address ${address}:`, err)
	}
}

const getTransactions = async (address) => {
	try {
		const response = await axios.get(
			`https://api.blockcypher.com/v1/btc/test3/addrs/${address}/full`
		)
		const transactions = response.data.txs.map((tx) => ({
			hash: tx.hash,
			value:
				tx.outputs.find((output) => output.addresses.includes(address))
					.value / 100000000, // Convert from satoshis to BTC
			received_at: tx.received,
		}))
		console.log(`Transactions for address ${address}:`, transactions)
	} catch (err) {
		console.error(
			`Error retrieving transactions for address ${address}:`,
			err
		)
	}
}

const generateUnusedadd = async (mnemonic) => {
	db.get(
		`SELECT * FROM wallets WHERE mnemonic = ?`,
		[mnemonic],
		async (err, row) => {
			if (err) {
				console.log(err)
			} else {
				const used = row.used + 1
				const seed = await bip39.mnemonicToSeed(mnemonic)
				const root = hdkey.fromMasterSeed(
					seed,
					bitcoin.networks.testnet
				)
				const addrNode = root.derive(`m/44'/1'/0'/0/${used}`)
				const address = bitcoin.payments.p2pkh({
					pubkey: addrNode.publicKey,
					network: bitcoin.networks.testnet,
				}).address
				await db.run("UPDATE wallets SET used = ? WHERE mnemonic = ?", [
					used,
					mnemonic,
				])
				console.log(`Unused Wallet Address: ${address}`)
			}
		}
	)
}

module.exports = {
	createWallet,
	importWallet,
	listWallets,
	getBalance,
	getTransactions,
	generateUnusedadd,
}
