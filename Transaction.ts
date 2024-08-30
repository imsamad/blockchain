import { Block } from './Block';
import { Wallet } from './Wallet';
import { v4 as uuid } from 'uuid';
import { hash, verifySignatire } from './utils';
import EC from 'elliptic';
import { MINIG_REWARD } from './const';

export class Transaction {
  id: string;

  input: {
    timestamp: Block['timestamp'];
    amount: number;
    signature: EC.ec.Signature;
    address: string;
  } | null;

  outputs: { amount: number; address: string }[] = [];

  constructor() {
    this.id = uuid();
    this.input = null;
  }

  static transactionWithOutput(
    senderWallet: Wallet,
    outputs: Transaction['outputs']
  ) {
    const txn = new Transaction();
    txn.outputs.push(...outputs);

    txn.input = this.signTransaction(txn, senderWallet);
    return txn;
  }

  static newTransaction(
    senderWallet: Wallet,
    recipient: string,
    amount: number
  ) {
    if (amount > senderWallet.balance) {
      console.log('insufficient balance');
      return;
    }

    return Transaction.transactionWithOutput(senderWallet, [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
      },
      { amount, address: recipient },
    ]);
  }

  static signTransaction(transaction: Transaction, senderWallet: Wallet) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(hash(transaction.outputs)),
    };
  }

  static rewardTransaction(minerWallet: Wallet, blockchainWallet: Wallet) {
    return Transaction.transactionWithOutput(blockchainWallet, [
      {
        amount: MINIG_REWARD,
        address: minerWallet.publicKey,
      },
      // {
      //   amount: blockchainWallet.balance - MINIG_REWARD,
      //   address: blockchainWallet.publicKey,
      // },
    ]);
  }

  static verifyTransaction(transaction: Transaction) {
    if (!transaction.input) return false;
    return verifySignatire(
      transaction.input.address,
      transaction.input.signature,
      hash(transaction.outputs)
    );
  }

  update(senderWallet: Wallet, recipient: string, amount: number) {
    // const senderOutput = this.outputs.filter(
    //   (out) => out.address == senderWallet.publicKey
    // );

    // const totalDebited = senderOutput.reduce((acc,obj) => acc + obj.amount, 0);
    const senderOutput = this.outputs.find(
      (out) => out.address == senderWallet.publicKey
    );

    if (!senderOutput || amount > senderOutput?.amount) return;

    senderOutput.amount = senderOutput.amount - amount;

    this.outputs.push({ address: recipient, amount });

    this.input = Transaction.signTransaction(this, senderWallet);

    return this;
  }
}
