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
			// console.log("Connected to database")
		}
	}
)

db.run(
	"CREATE TABLE IF NOT EXISTS wallets (name TEXT PRIMARY KEY, mnemonic TEXT, address TEXT, used_add INTEGER Default 1)",
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
  import "wallet name" "BIP39 mnemonic"
  list
  balance "wallet name"
  transactions "wallet name"
  unused "wallet name"
  man

DESCRIPTION
  create : create a new wallet with given name. Enclose in double quotes if contains spaces
  import : import a new wallet into database with given name from given mnemonic string. Enclose in double quotes
  list : list all wallets stored in the database currently
  balance : show balance of chosen wallet by it's name
  transactions : show all transactions of chosen wallet by it's name
  unused : generate an unused address for the chosen wallet by it's name
  man : display this command manual
`

function run() {
	// console.log(args)
	command = args._[0]
	inp1 = args._[1]
	inp2 = args._[2]

	if (command != "list" && (!inp1 || inp1.length == 0))
		console.log("Invalid arguments. Use man to see manual.")
	else {
		if (command == "create") {
			actions.createWallet(db, inp1)
		} else if (command == "import") {
			actions.importWallet(db, inp1, inp2)
		} else if (command == "list") {
			actions.listWallets(db)
		} else if (command == "balance") {
			actions.getBalance(db, inp1)
		} else if (command == "transactions") {
			actions.getTransactions(db, inp1)
		} else if (command == "unused") {
			actions.getTransactions(db, inp1)
		} else if (command == "man") {
			console.log(help_text)
		} else {
			console.log("Invalid command. Use man to see manual.")
		}
	}
}
