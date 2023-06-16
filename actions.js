const bip39 = require("bip39")
const bitcoin = require("bitcoinjs-lib")
const hdkey = require("hdkey")
const axios = require("axios")

const createWallet = async (db, wallet_name) => {
	const mnemonic = bip39.generateMnemonic()
	const seed = await bip39.mnemonicToSeed(mnemonic)
	const root = hdkey.fromMasterSeed(seed, bitcoin.networks.testnet)
	const addrNode = root.derive("m/44'/1'/0'/0/0") // m/44'/0'/0'/0/0 for mainnet
	const address = bitcoin.payments.p2pkh({
		pubkey: addrNode.publicKey,
		network: bitcoin.networks.testnet,
	}).address
	await db.run(
		"INSERT INTO wallets (name, mnemonic, address) VALUES (?, ?, ?)",
		[wallet_name, mnemonic, address],
		function (err) {
			if (err) {
				console.log(err)
				console.log(
					`You already have a wallet saved with name ${wallet_name}`
				)
			} else {
				console.log(`New Wallet created with name ${wallet_name}`)
				console.log(`New Wallet's First Address: ${address}`)
				console.log(`Mnemonic: ${mnemonic}`)
			}
		}
	)
}

const importWallet = async (db, wallet_name, mnemonic) => {
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
		"INSERT INTO wallets (name, mnemonic, address) VALUES (?, ?, ?)",
		[wallet_name, mnemonic, address],
		function (err) {
			if (err) {
				console.log(err)
				console.log(
					`You already have a wallet saved with name ${wallet_name}`
				)
			} else {
				console.log(`New Wallet imported with name: ${wallet_name}`)
				console.log(`Imported Wallet Address: ${address}`)
			}
		}
	)
}

const listWallets = async (db) => {
	db.all("SELECT * FROM wallets", [], (err, rows) => {
		if (err) console.log(err)
		else console.log(rows)
	})
}

const getBalance = async (db, wallet_name) => {
	db.get(
		"SELECT * FROM wallets WHERE name=?",
		[wallet_name],
		async (err, row) => {
			if (err || !row) {
				// console.log(err)
				console.log(`No wallets saved with given name ${wallet_name}`)
			} else {
				try {
					const response = await axios.get(
						`https://api.blockcypher.com/v1/btc/test3/addrs/${row.address}/balance`
					)
					const balance = response.data.balance / 100000000
					console.log(
						`Balance of wallet ${row.name} with last address ${row.address}: ${balance} BTC`
					)
				} catch (err) {
					console.error(
						`Error retrieving balance for wallet ${row.name}:`,
						err
					)
				}
			}
		}
	)
}

const getTransactions = async (db, wallet_name) => {
	db.get(
		"SELECT * FROM wallets WHERE name=?",
		[wallet_name],
		async (err, row) => {
			if (err || !row) {
				// console.log(err)
				console.log(`No wallets saved with given name ${wallet_name}`)
			} else {
				try {
					const response = await axios.get(
						`https://api.blockcypher.com/v1/btc/test3/addrs/${row.address}/full`
					)
					const transactions = response.data.txs.map((tx) => ({
						hash: tx.hash,
						value:
							tx.outputs.find((output) =>
								output.addresses.includes(row.address)
							).value / 100000000, // Convert from satoshis to BTC
						received_at: tx.received,
					}))
					console.log(
						`Transactions for wallet ${row.name} with last address ${row.address}:`,
						transactions
					)
				} catch (err) {
					console.error(
						`Error retrieving transactions for wallet ${row.name}:`,
						err
					)
				}
			}
		}
	)
}

const generateUnusedAdd = async (db, wallet_name) => {
	db.get(
		`SELECT * FROM wallets WHERE name = ?`,
		[wallet_name],
		async (err, row) => {
			if (err || !row) {
				// console.log(err)
				console.log(`No wallets saved with given name ${wallet_name}`)
			} else {
				const used = row.used_add + 1
				const seed = await bip39.mnemonicToSeed(row.mnemonic)
				const root = hdkey.fromMasterSeed(
					seed,
					bitcoin.networks.testnet
				)
				const addrNode = root.derive(`m/44'/1'/0'/0/${used}`)
				const address = bitcoin.payments.p2pkh({
					pubkey: addrNode.publicKey,
					network: bitcoin.networks.testnet,
				}).address
				await db.run(
					"UPDATE wallets SET used_add = ? WHERE name = ?",
					[used, wallet_name],
					(err) => {
						if (err) console.log(err)
					}
				)
				console.log(
					`Unused address for wallet ${wallet_name}: ${address}`
				)
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
	generateUnusedAdd,
}
