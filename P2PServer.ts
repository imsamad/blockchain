import { v4 as uuid } from 'uuid';
import { Blockchain } from './Blockchain';
import ws from 'ws';
import { Transaction } from './Transaction';
import { Block } from './Block';
import { TransactionPool } from './TransactionPool';
const WS_PORT = Number(process.env.WS_PORT) || 5001;
enum MESSAGE_TYPES {
  TRANSACTIONS = 'TRANSACTIONS',
  CHAIN = 'CHAIN',
  CLEAR_TRANSACTIONS = 'CLEAR_TRANSACTIONS',
}

type T_INCOMING_MESSAGE =
  | {
      message: Transaction;
      type: MESSAGE_TYPES.TRANSACTIONS;
    }
  | {
      type: MESSAGE_TYPES.CHAIN;
      message: Blockchain['chain'];
    }
  | {
      type: MESSAGE_TYPES.CLEAR_TRANSACTIONS;
    };

const peers = process.env.PEERS?.split(',').map((p) => `ws://localhost:${p}`);

export class P2PServer {
  blockchain: Blockchain;
  transactionPool: TransactionPool;

  sockets: { id: string; socket: ws }[];

  constructor(blockchain: Blockchain, transactionPool: TransactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
    this.listen();
  }

  listen() {
    const server = new ws.Server({
      port: WS_PORT,
    });

    server.on('connection', (socket) => {
      const id = uuid();
      console.log(`On ${WS_PORT} connected`);
      socket.on('close', () => {
        this.sockets = this.sockets.filter(({ id: i }) => id != i);
        console.log('closed');
      });

      // send blockchain to newly connected peer
      this.sockets.push({ id, socket });

      this.handleConection(socket);
      this.handleIncomingMessage(socket);
    });
    this.connectToPeers();
  }

  handleConection(socket: ws) {
    this.sendMessage(socket, this.blockchain.chain);
  }

  handleIncomingMessage(socket: ws) {
    socket.on('message', (msg) => {
      const message: T_INCOMING_MESSAGE = JSON.parse(msg.toString());

      if (message.type == MESSAGE_TYPES.TRANSACTIONS) {
        this.transactionPool.updateOrAddTransaction(message.message);
      } else if (message.type == MESSAGE_TYPES.CHAIN) {
        this.blockchain.replaceChain(message.message);
      } else if (message.type == MESSAGE_TYPES.CLEAR_TRANSACTIONS)
        this.transactionPool.clear();
    });
  }

  connectToPeers() {
    peers?.forEach((peer: string) => {
      const socket = new ws(peer);
      socket.on('open', () => {
        const id = uuid();
        console.log('opened: ', peer);
        this.sockets.push({ id, socket });
        //   this.handleConection(socket);
        this.handleIncomingMessage(socket);
      });
    });
  }

  sendMessage(socket: ws, message: Transaction | Blockchain['chain']) {
    socket.send(
      JSON.stringify({
        type:
          message instanceof Transaction
            ? MESSAGE_TYPES.TRANSACTIONS
            : MESSAGE_TYPES.CHAIN,
        message,
      })
    );
  }

  sendChain(socket: ws) {
    this.sendMessage(socket, this.blockchain.chain);
  }

  syncChains() {
    this.sockets.forEach((s) => this.sendChain(s.socket));
  }

  sendTransaction(socket: ws, transaction: Transaction) {
    this.sendMessage(socket, transaction);
  }

  broadcastTransaction(transaction: Transaction) {
    this.sockets.forEach((s) => this.sendTransaction(s.socket, transaction));
  }

  broadcastClearTransactions() {
    this.sockets.forEach(({ socket }) =>
      socket.send(JSON.stringify({ type: MESSAGE_TYPES.CLEAR_TRANSACTIONS }))
    );
  }
}
