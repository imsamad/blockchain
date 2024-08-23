import { Block } from './Block';

export class Blockchain {
  chain: Block[];
  constructor() {
    this.chain = [Block.genesis()];
  }

  public addBlock(data: any) {
    this.chain.push(Block.mineBlock(this.chain[this.chain.length - 1], data));
    return this.chain[this.chain.length - 1];
  }

  public isChainValid(chain: Blockchain['chain']) {
    const isGenesisBlockTempered =
      JSON.stringify(Block.blockify(chain[0]).toSring()) !=
      JSON.stringify(Block.genesis().toSring());

    if (this.chain.length >= chain.length) return false;

    for (let i = 1; i < chain.length; i++) {
      if (
        chain[i].hash != Block.blockHash(chain[i]) ||
        chain[i - 1].hash != chain[i].lastHash
      )
        return false;
    }

    return true;
  }

  public replaceChain(newChain: Blockchain['chain']) {
    if (this.isChainValid(newChain)) this.chain = newChain;
  }
}
