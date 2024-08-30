import { SHA256 } from 'crypto-js';
import EC from 'elliptic';

const ec = new EC.ec('secp256k1');

export const genKeyPair = () => ec.genKeyPair();

export function verifySignatire(
  publicKey: string,
  signature: EC.ec.Signature,
  dataHash: string
) {
  return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
}

export const hash = (data: any) => SHA256(JSON.stringify(data)).toString();
