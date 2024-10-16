import base58 from 'bs58';
import { Keccak } from 'sha3';
import { pack } from 'msgpackr';
import { Buffer } from 'buffer';

export default class Key {
  #nominal: undefined;

  constructor(public data: Uint8Array) { }

  static random() {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return new Key(randomBytes);
  }

  // Encode the key as base58
  base58() {
    return base58.encode(this.data);
  }

  // Decode from base58 and create a Key instance
  static fromBase58(data: string) {
    return new Key(base58.decode(data));
  }

  static fromSeed(seed: unknown) {
    const hash = new Keccak(256);
    hash.update(Buffer.from(pack(seed)));
    return new Key(new Uint8Array(hash.digest()));
  }
}
