/**
 * Utility functions for masking and sanitizing sensitive data
 */

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [user, domain] = email.split('@');
  if (!domain) return '***@***.***';
  const maskedUser = user.length <= 2 ? `${user[0]}*` : `${user[0]}***${user[user.length - 1]}`;
  return `${maskedUser}@${domain}`;
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '********';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export function sanitizeString(input: string): string {
  return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}
