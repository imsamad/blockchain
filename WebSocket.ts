import { v4 as uuid } from 'uuid';
import { Blockchain } from './Blockchain';
import ws from 'ws';
const WS_PORT = Number(process.env.WS_PORT) || 5001;

const peers = process.env.PEERS?.split(',').map((p) => `ws://localhost:${p}`);

export class P2PServer {
  blockchain: Blockchain;
  sockets: { id: string; socket: ws }[];

  constructor(blockchain: Blockchain) {
    this.blockchain = blockchain;
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
    socket.send(JSON.stringify(this.blockchain.chain));
  }

  handleIncomingMessage(socket: ws) {
    socket.on('message', (msg) => {
      // @ts-ignore
      this.blockchain.replaceChain(JSON.parse(msg));
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

  sendChain(socket: ws) {
    socket.send(JSON.stringify(this.blockchain.chain));
  }

  syncChains() {
    this.sockets.forEach((s) => this.sendChain(s.socket));
  }
}
