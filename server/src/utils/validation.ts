export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
};

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (!username || username.trim().length < 2) {
    return { valid: false, message: 'Username must be at least 2 characters long' };
  }
  if (username.length > 30) {
    return { valid: false, message: 'Username must not exceed 30 characters' };
  }
  return { valid: true };
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};
