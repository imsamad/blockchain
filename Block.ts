import { SHA256 } from 'crypto-js';
import { DIFFICULTY, MINE_RATE } from './const';

export class Block {
  data: any;
  timeStamp: number;
  hash: string;
  lastHash: string;
  nonce: number;
  difficulty: number;

  constructor(
    data: any,
    timeStamp: number,
    hash: string,
    lastHash: string,
    nonce: number,
    difficulty: number
  ) {
    this.data = data;
    this.timeStamp = timeStamp;
    this.hash = hash;
    this.lastHash = lastHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  public toSring() {
    return `Block
          Timestamp  : ${this.timeStamp}
          Last Hash  : ${this.lastHash}
          Hash       : ${this.hash}
          Nonce      : ${this.nonce}
          Difficulty : ${this.difficulty}
          Data       : ${this.data}
      `;
  }

  static blockify(data: any) {
    return new Block(
      data.data,
      data.timeStamp,
      data.hash,
      data.lastHash,
      data.nonce,
      data.difficulty
    );
  }

  static blockHash(block: Block) {
    return Block.hash(
      block.timeStamp,
      block.lastHash,
      block.data,
      block.nonce,
      block.difficulty
    );
  }

  static genesis() {
    let nonce = 0;
    return new Block([], Date.now(), 'f1r57-h45h', '---', nonce, DIFFICULTY);
  }

  static adjustDifficulty(
    prev: Block['timeStamp'],
    curr: Block['timeStamp'],
    difficulty: Block['difficulty']
  ) {
    console.log({ delta: curr - prev, difficulty, MINE_RATE });

    return curr - prev > MINE_RATE
      ? difficulty == 1
        ? difficulty
        : difficulty - 1
      : difficulty + 1;
  }

  static mineBlock(lastBlock: Block, data: any) {
    const lastHash = lastBlock.hash;

    let timeStamp: Block['timeStamp'];
    let nonce: Block['nonce'] = 0;
    let hash: Block['hash'] = '';
    let difficulty = lastBlock.difficulty;

    do {
      timeStamp = Date.now();
      nonce++;
      difficulty = Block.adjustDifficulty(
        lastBlock.timeStamp,
        timeStamp,
        difficulty
      );

      hash = Block.hash(timeStamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) != '0'.repeat(difficulty));
    return new Block(data, timeStamp, hash, lastHash, nonce, difficulty);
  }

  static hash(
    timeStamp: number,
    lastHash: string,
    data: any,
    nonce: number,
    difficulty: number
  ) {
    return SHA256(
      `${timeStamp}${lastHash}${data}${nonce}${difficulty}`
    ).toString();
  }
}
