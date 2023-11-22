import { createLogger, format, transports } from 'winston'

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
  transports: [new transports.Console()]
})

logger.close()

export default logger
