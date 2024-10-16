import crypto from 'crypto';
import base58 from 'bs58';
import { Keccak } from 'sha3';
import { pack } from 'msgpackr';

export default class Key {
  #nominal: undefined;

  constructor(public data: Uint8Array) { }

  static random() {
    return new Key(new Uint8Array(crypto.randomBytes(32)));
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
    hash.update(pack(seed));
    return new Key(new Uint8Array(hash.digest()));
  }
}
