const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  const [salt, keyHex] = String(stored || '').split(':');
  if (!salt || !keyHex) return false;
  const derived = await scrypt(password, salt, 64);
  const storedKey = Buffer.from(keyHex, 'hex');
  return storedKey.length === derived.length && crypto.timingSafeEqual(storedKey, derived);
}

module.exports = { hashPassword, verifyPassword };
