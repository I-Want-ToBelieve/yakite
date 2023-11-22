#!/usr/bin/env node
import zmq from 'zeromq'

import Yabai from 'yakite-yabai'
import logger from '@/common/logger'
import config from 'yakite-config'
import { $ } from 'execa'
import { WindowsManager } from 'krohnkite-core'
import parseJson from 'parse-json'
import fastJson from 'fast-json-stringify'
import { type Message } from 'yakite-message'
import { jsonSchemaMessage } from 'yakite-message'
import { YakiteBridge } from 'yakite-bridge'

process.title = 'yakite-daemon'

// TODO use pid file lock
try {
  await Promise.all([$`killall yakite`, $`pkill -f yakite-daemon`])
} catch (error) {
}

const sock = new zmq.Reply()
await sock.bind('tcp://127.0.0.1:20206')

/**
 * real state(from yabai cli) <-> clone state (the yabai class)<-> bridge state (the YakiteBridge)<-> engine state(the WindowsManager)
 *
 */
const yabai = await Yabai.create()
const bridge = await YakiteBridge.create(yabai, config, logger)

const wm = new WindowsManager(
  bridge,
  config,
  logger
)

wm.start()

process.on('exit', () => {
  void yabai.drop?.()
})

const stringify = fastJson(jsonSchemaMessage)

// message queue loop
for await (const [buffer] of sock) {
  const json = buffer.toString()

  const { env, message, type } = parseJson(json) as unknown as Message

  logger.info({ env, message, type })

  switch (type) {
    case 'event':
      await bridge.wrappedListeners[message](env as any)
      break
    case 'action':
      bridge.actions[message]()
      break
    default:
      break
  }

  logger.info('sock.send()')

  await sock.send(stringify({ env, message, type, code: 200 }))
}
