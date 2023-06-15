const args = require("yargs").argv
const sqlite3 = require("sqlite3")
const actions = require("./actions")

const db = new sqlite3.Database(
	"./wallets.sqlite",
	sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX,
	(err) => {
		if (err) {
			console.log(err)
		}
	}
)

db.run(
	"CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY, mnemonic TEXT, address TEXT, used_add INTEGER Default 1)"
)

// console.log(args)
command = args._[0]
if (command == "create") actions.createWallet(db)
else if (command == "import") {
	mnemonic_str = args["m"]
	actions.importWallet(db, mnemonic_str)
} else if (command == "list") actions.listWallets(db)
else if (command == "balance") {
	wallet_id = args["id"]
	actions.getBalance(db, wallet_id)
} else if (command == "transactions") {
	wallet_id = args["id"]
	actions.getTransactions(db, wallet_id)
} else if (command == "unused") {
	wallet_id = args["id"]
	actions.getTransactions(db, wallet_id)
}
