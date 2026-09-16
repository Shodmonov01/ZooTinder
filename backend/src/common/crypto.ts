import { createHash, randomBytes, randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';

export async function hashSecret(value: string): Promise<string> {
  return bcrypt.hash(value, 10);
}

export async function verifySecret(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function canonicalPetPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}
