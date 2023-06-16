# bit-wallet-cli

This repository contains a node.js script that allows you to create and import bitcoin wallets using BIP39 Mnemonic. The wallets are stored locally using sqlite3 database. You can also check balance and transactions for each wallet and generate unused addresses for any of the saved wallets.

## Dependencies

The script requires following dependencies

-   [bitcoinjs-lib](https://github.com/bitcoinjs/bitcoinjs-lib)
-   [bip39](https://github.com/bitcoinjs/bip39)
-   [hdkey](https://github.com/cryptocoinjs/hdkey)
-   [sqlite3](https://github.com/TryGhost/node-sqlite3)
-   [axios](https://github.com/axios/axios)
-   [yargs](https://github.com/yargs/yargs)

You can install these dependencies using `npm i`

## Usage

To use this script simply run
`node wallet command [ARGS]`

The script supports following commands:

-   `man`
-   `create "wallet_name"`
-   `import "wallet name" "BIP39 mnemonic"`
-   `list`
-   ` balance "wallet name`
-   `transactions "wallet name"`
-   `unused "wallet name"`

Description for each command:

-   create : Create a new wallet with given name. Enclose in double quotes if contains spaces.
-   import : Import a new wallet into database with given name from given mnemonic string. Enclose in double quotes.
-   list : List all wallets stored in the database currently.
-   balance : Show balance of chosen wallet by it's name.
-   transactions : Show all transactions of chosen wallet by it's name.
-   unused : Generate an unused address for the chosen wallet by it's name.
-   man : Displays the command manual.
