const args = require("yargs").argv
const sqlite3 = require("sqlite3")

// initiate db connection
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
	"CREATE TABLE IF NOT EXISTS wallets (id INTEGER PRIMARY KEY, mnemonic TEXT, address TEXT, used_add INTEGER Default 1)"
)

console.log(args)
