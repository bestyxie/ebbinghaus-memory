import bcrypt from 'bcrypt';

const saltRound = 10;

export async function saltAndHashPassword (pwd: string) {
  const hash = await bcrypt.hash(pwd, saltRound)
  return hash
}

export async function verifyPassword (pwd: string, hash: string) {
  return bcrypt.compare(pwd, hash)
}