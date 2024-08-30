import { Blockchain } from './Blockchain';
import { P2PServer } from './P2PServer';
import { Transaction } from './Transaction';
import { TransactionPool } from './TransactionPool';
import { Wallet } from './Wallet';

export class Miner {
  blockchain: Blockchain;
  tp: TransactionPool;
  wallet: Wallet;
  p2pServer: P2PServer;

  constructor(
    blockchain: Blockchain,
    tp: TransactionPool,
    wallet: Wallet,
    p2pServer: P2PServer
  ) {
    this.blockchain = blockchain;
    this.tp = tp;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    const validTransactions = this.tp.validTransactions();
    console.log('validTransactions: ', validTransactions);
    if (!validTransactions.length) return undefined;
    // after succefully creating block,
    // create a reward txn for miner
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainwallet())
    );

    const block = this.blockchain.addBlock(validTransactions);

    // sync txns-chain across n/w
    this.p2pServer.syncChains();

    // clear the tp
    this.tp.clear();
    // broadcast it to n/w

    this.p2pServer.broadcastClearTransactions();
    return block;
  }
}
