import EC from 'elliptic';
import { genKeyPair } from './utils';
import { INITIAL_BALANCE } from './const';
import { TransactionPool } from './TransactionPool';
import { Transaction } from './Transaction';
import { Blockchain } from './Blockchain';

export class Wallet {
  keyPair: EC.ec.KeyPair;
  balance: number;
  publicKey: string;
  // address:string;

  constructor() {
    this.keyPair = genKeyPair();
    this.balance = INITIAL_BALANCE;
    this.publicKey = this.keyPair.getPublic().encode('hex', false);
  }

  sign(data: any) {
    return this.keyPair.sign(data);
  }

  createTrasaction(
    recepient: string,
    amount: number,
    blockchain: Blockchain,
    transactionPool: TransactionPool
  ) {
    this.balance = this.calculateBalance(blockchain);
    if (amount > this.balance) {
      console.log('insufficient funds');
      return undefined;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      transaction.update(this, recepient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recepient, amount);
      if (transaction) transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }
  calculateBalance(blockchain: Blockchain) {
    let balance = this.balance;
    let transactions: Transaction[] = [];

    blockchain.chain.forEach((block) => {
      block.data.forEach((transaction: Transaction) => {
        transactions.push(transaction);
      });
    });

    const walletInputTs = transactions.filter(
      (transaction) => transaction.input?.address == this.publicKey
    );

    let startTime = 0;

    if (walletInputTs.length) {
      const recentInputT = walletInputTs.reduce((prev, curr) =>
        prev.input?.timestamp &&
        curr.input?.timestamp &&
        prev.input?.timestamp > curr.input?.timestamp
          ? prev
          : curr
      );

      balance =
        recentInputT.outputs.find((out) => out.address == this.publicKey)
          ?.amount || 0;
      startTime = recentInputT.input?.timestamp || 0;
    }

    transactions.forEach((transaction) => {
      if (
        transaction.input?.timestamp &&
        transaction.input?.timestamp > startTime
      ) {
        transaction.outputs.find((output) => {
          if (output.address == this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });
    return balance;
  }

  static blockchainwallet() {
    const blockchainWallet = new Wallet();
    // @ts-ignore
    blockchainWallet.address = 'blockchain-wallet';
    return blockchainWallet;
  }
}
