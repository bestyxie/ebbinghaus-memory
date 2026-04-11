import { createHash, randomBytes } from 'crypto'

/** Returns a raw token string of the form `emb_<48 hex chars>`. Never stored — return once to user. */
export function generateRawToken(): string {
  return 'emb_' + randomBytes(24).toString('hex')
}

/** SHA-256 hash of rawToken — safe to store in DB. */
export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
