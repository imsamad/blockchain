### 51% attack

Block - class
Blockchain class - valdiate and replace chain
Nonce -
Dynamic difficulty -

## Cryptocurrecny

- Blockchain-powered cryptocurrencies have, following are related thingy

1. Wallet
2. Transactions
3. Digital Signature

### Wallets

- In terns of cryptocurrency, It is an object with 3 main components - balance, keys.
- store user balance on blockchain-powered cryptocurrency
- store pub/pvt key pair - every txn generated would be encryoted with pvt key and verified by pub key .

### transation

transation consist of fields

input contains sender's balance, timestamp, public key

input: {
balance:500,
timestamp:,
sender's pub key:,
signature: encryption(Outputs)
}

they are recored to keep the history of txn/transfers.
outputs: [
{
balance:10, // amount to send to reciever
address:to // reciever's address
},{
balance: 490, // sender final balance to be settled to
address: myaddres // senders public key
}
]

### transations

- list of above txn, make txns.
- net balance is calculated by doing relevent ops on this list.
- it is stored in wallet

### digital signature

public key can be extracted from private key.

---- implementation

#### Key Pair generation -

- Elliptic is being used to generate pair.
- It work on the principal that it is computationally infesible to guess the answer around randomly genrated elliptic curve.

- Lot of implementation are there for elliptic, bitcoin use secp256k1
- Full form sec
- Standard of efficient cryptography
- p - prime
- 256 - bit -
- k - koblet - mathematician is cryotigraoy
- 1 - version OR 1st implementation of elliptic
- so main component of this implemenation is that - it used 256bits long prime number to generate random curves.
- k -

#### Transaction Pool

- Maintain txn pool. categories into two types

1. confirmed - have been included in blockchain so far.
2. unconfirmed - all the txn not been included in blockchain yet.

- That way maintau history of txn submiited to blockchain.

- MINE_RATE decide at which unconfirmned txn are shifted to confirmed.

##### Miners of transactions

- When you combine the blockchain and txn-pool - u get miners.
- Miners take the txn from pool and store then into blocks.

#### Cryptocurrency is not just based on blockchain,example tangle
