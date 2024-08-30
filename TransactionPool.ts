import { Transaction } from './Transaction';

export class TransactionPool {
  transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(txn: Transaction) {
    const transaction = this.transactions.find(({ id }) => id == txn.id);

    if (transaction) {
      this.transactions[this.transactions.indexOf(transaction)] = txn;
    } else {
      this.transactions.push(txn);
    }
  }

  existingTransaction(addr: string) {
    return this.transactions.find((txn) => txn.input?.address == addr);
  }

  validTransactions() {
    return this.transactions.filter((transaction) => {
      const outTotal = transaction.outputs.reduce(
        (total, output) => total + output.amount,
        0
      );

      if (transaction.input?.amount != outTotal) return undefined;

      if (!Transaction.verifyTransaction(transaction)) return undefined;

      return transaction;
    });
  }

  clear() {
    this.transactions = [];
  }
}
