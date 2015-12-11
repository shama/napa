'use strict'
import { spawn } from 'child_process'
import Promise from 'bluebird'
import log from 'npmlog'

export default function cli (cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const line = spawn(cmd, args, opts)
    line.stdout.on('data', (data) => {
      log.info('napa', data.toString())
    })
    line.stderr.on('data', (err) => {
      log.error('napa', err.toString())
    })
    line.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
    })
  })
}
