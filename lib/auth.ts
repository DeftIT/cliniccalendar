import bcrypt from "bcryptjs";

export async function verifyPin(pin: string): Promise<boolean> {
  const hash = process.env.ADMIN_PIN_HASH;
  if (!hash) return false;
  return bcrypt.compare(pin, hash);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}
