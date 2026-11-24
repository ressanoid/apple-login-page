export function isValidEmail(email: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) && email.length <= 254
}

export function isValidPassword(password: string) {
  return password.length >= 8 && password.length <= 128
}
