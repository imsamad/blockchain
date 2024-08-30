import express from 'express';

import { Blockchain } from './Blockchain';
import { P2PServer } from './P2PServer';
import { Wallet } from './Wallet';
import { TransactionPool } from './TransactionPool';
import { Miner } from './Miner';

const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2p = new P2PServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2p);
const app = express();

app.use(express.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  bc.addBlock(req.body.data);
  p2p.syncChains();
  res.redirect('/blocks');
});

app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
  const { recepient, amount } = req.body;

  const transaction = wallet.createTrasaction(recepient, amount, bc, tp);
  if (transaction) p2p.broadcastTransaction(transaction);
  else return res.json({ ok: 'nope' });
  res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get('/tp', (req, res) => {
  res.json({ tp: tp.transactions });
});

app.post('/mine-transactions', (req, res) => {
  const block = miner.mine();

  res.redirect('/blocks');
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`running at ${PORT}`);
});
