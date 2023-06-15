const bip39 = require("bip39")
const bitcoin = require("bitcoinjs-lib")
const hdkey = require("hdkey")
const sqlite3 = require("sqlite3")

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

export const importWallet = async(mnemonic) => {
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
