const bip39 = require("bip39")
const bitcoin = require("bitcoinjs-lib")
const hdkey = require("hdkey")
const sqlite3 = require("sqlite3")
const axios = require("axios")

const db = new sqlite3.Database(
	"./wallets.sqlite",
	sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
	(err) => {
		if (err) {
			console.log(err)
		} else {
			console.log("Connected to the database")
		}
	}
)

db.run(
	"CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY, mnemonic TEXT, address TEXT)"
)

export const createWallet = async () => {
	const mnemonic = bip39.generateMnemonic()
	const seed = await bip39.mnemonicToSeed(mnemonic)
	const root = hdkey.fromMasterSeed(seed, bitcoin.networks.testnet)
	const addrNode = root.derive("m/44'/1'/0'/0/0") // m/44'/0'/0'/0/0 for mainnet
	const address = bitcoin.payments.p2pkh({
		pubkey: addrNode.publicKey,
		network: bitcoin.networks.testnet,
	}).address
	await db.run("INSERT INTO wallets (mnemonic, address) VALUES (?, ?)", [
		mnemonic,
		address,
	])
	console.log(`New Wallet's First Address: ${address}`)
	console.log(`Mnemonic: ${mnemonic}`)
}

export const importWallet = async (mnemonic) => {
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
	await db.run("INSERT INTO wallets (mnemonic, address) VALUES (?, ?)", [
		mnemonic,
		address,
	])
	console.log(`Imported Wallet Address: ${address}`)
}

export const listWallets = async () => {
	db.all("SELECT * FROM wallets", [], (err, rows) => {
		if (err) console.log(err)
		else console.log(rows)
	})
}

export const getTestnetBalance = async (address) => {
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

