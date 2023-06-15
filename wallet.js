const args = require("yargs").argv
const sqlite3 = require("sqlite3")
const actions = require("./actions")

const db = new sqlite3.Database(
	"./wallets.sqlite",
	sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,
	(err) => {
		if (err) {
			console.log(err)
		} else {
			console.log("Connected to database")
		}
	}
)

db.run(
	"CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY, name TEXT, mnemonic TEXT, address TEXT, used_add INTEGER Default 1)",
	[],
	(err) => {
		if (err) console.log(err)
		else run()
	}
)

help_text = `
USAGE
  $ node index.js command [ARGS]

COMMANDS
  create "wallet name"
  import "BIP39 mnemonic"
  list
  balance "wallet name"
  transactions "wallet name"
  unused "wallet name"
  man

DESCRIPTION
  create : create a new wallet with given name. Enclose in double quotes if contains spaces
  import : import a new wallet into database from given mnemonic string. Enclose in double quotes
  list : list all wallets stored in the database currently
  balance : show balance of chosen wallet by it's name
  transactions : show all transactions of chosen wallet by it's name
  unused : generate an unused address for the chosen wallet by it's name
  man : display this command manual
`
function run() {
	console.log(args)
	command = args._[0]
	if (command == "create") {
		wallet_name = args._[1]
		actions.createWallet(db, wallet_name)
	} else if (command == "import") {
		mnemonic_str = args._[1]
		actions.importWallet(db, mnemonic_str)
	} else if (command == "list") {
		actions.listWallets(db)
	} else if (command == "balance") {
		wallet_id = args._[1]
		actions.getBalance(db, wallet_id)
	} else if (command == "transactions") {
		wallet_id = args._[1]
		actions.getTransactions(db, wallet_id)
	} else if (command == "unused") {
		wallet_id = args._[1]
		actions.getTransactions(db, wallet_id)
	} else if (command == "man") {
		console.log(help_text)
	} else {
		console.log("Invalid command. Use man to see manual.")
	}
}
