import { createLogger, format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
}

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  levels: logLevels,
  transports: [new DailyRotateFile({
    dirname: '/tmp',
    filename: 'yakite-daemon-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: false,
    maxSize: '20m',
    maxFiles: '14d'
  })]
})

export default logger
