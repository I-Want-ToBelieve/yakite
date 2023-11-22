export interface Logger {
  info: (...args: any) => any
  warn: (...args: any) => any
  error: (...args: any) => any
  debug: (...args: any) => any
}
