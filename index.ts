import express from 'express';
import { Blockchain } from './Blockchain';
import { P2PServer } from './WebSocket';

const bc = new Blockchain();
const ws = new P2PServer(bc);

const app = express();
app.use(express.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  bc.addBlock(req.body.data);
  ws.syncChains();
  res.redirect('/blocks');
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`running at ${PORT}`);
});
