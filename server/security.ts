import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  try {
    // Validate hash format: 128 hex chars + dot + 32 hex chars
    if (!/^[0-9a-f]{128}\.[0-9a-f]{32}$/.test(stored)) {
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    // Return false instead of throwing on malformed passwords
    return false;
  }
}

export function isValidHashFormat(password: string): boolean {
  return /^[0-9a-f]{128}\.[0-9a-f]{32}$/i.test(password);
}

export function generateStrongPassword(): string {
  // Use crypto-secure random generation
  return randomBytes(18).toString('base64url');
}