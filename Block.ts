import { DIFFICULTY, MINE_RATE } from './const';
import { hash } from './utils';

export class Block {
  data: any;
  timestamp: number;
  hash: string;
  lastHash: string;
  nonce: number;
  difficulty: number;

  constructor(
    data: any,
    timestamp: number,
    hash: string,
    lastHash: string,
    nonce: number,
    difficulty: number
  ) {
    this.data = data;
    this.timestamp = timestamp;
    this.hash = hash;
    this.lastHash = lastHash;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  public toSring() {
    return `Block
          timestamp  : ${this.timestamp}
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
      data.timestamp,
      data.hash,
      data.lastHash,
      data.nonce,
      data.difficulty
    );
  }

  static blockHash(block: Block) {
    return Block.hash(
      block.timestamp,
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
    prev: Block['timestamp'],
    curr: Block['timestamp'],
    difficulty: Block['difficulty']
  ) {
    return curr - prev > MINE_RATE
      ? difficulty == 1
        ? difficulty
        : difficulty - 1
      : difficulty + 1;
  }

  static mineBlock(lastBlock: Block, data: any) {
    const lastHash = lastBlock.hash;

    let timestamp: Block['timestamp'];
    let nonce: Block['nonce'] = 0;
    let hash: Block['hash'] = '';
    let difficulty = lastBlock.difficulty;

    do {
      timestamp = Date.now();
      nonce++;
      difficulty = Block.adjustDifficulty(
        lastBlock.timestamp,
        timestamp,
        difficulty
      );

      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) != '0'.repeat(difficulty));
    return new Block(data, timestamp, hash, lastHash, nonce, difficulty);
  }

  static hash(
    timestamp: number,
    lastHash: string,
    data: any,
    nonce: number,
    difficulty: number
  ) {
    return hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`);
  }
}
