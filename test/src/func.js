'use strict'

const Promise = require('bluebird')
const cli = require('../../lib/cli')
const P = require('../../lib/pkg')
const rimraf = require('rimraf')
const fs = require('fs')
const log = require('npmlog')

const clean = function (filepaths, done) {
  let count = filepaths.length
  function cb () {
    count--
    if (count < 1) process.nextTick(done)
  }
  for (let i = 0; i < filepaths.length; i++) {
    rimraf(filepaths[i], cb)
  }
}

module.exports = function (args) {
  return new Promise(function (resolve, reject) {
    args = args.split(' ')
    const cmd = args[0]
    args = cli.parseArgs(args[1])
    let pk
    const Pkg = P.default
    switch (cmd) {
      case 'parse':
        resolve(args)
        break
      case 'load':
        pk = new Pkg(args[0], args[1], args[2])
        args = [pk.location, pk.name, pk.ref]
        resolve(args)
        break
      case 'git':
      case 'install':
        pk = new Pkg(args[0], args[1], args[2])
        clean([pk.installTo, pk.cache.cacheTo], function () {
          pk.install()
          .then((res) => {
            return resolve(res)
          })
        })
        break
      case 'cache':
        pk = new Pkg(args[0], args[1], args[2])
        clean([pk.installTo, pk.cache.cacheTo], function () {
          pk.install()
          .then((res) => {
            clean([res.installTo], function () {
              if (fs.existsSync(res.installTo)) {
                log.error('TEST', 'Install directory was not removed')
              } else {
                log.info('TEST', 'Install directory was successfully removed')
              }
              pk.install()
              .then((ress) => {
                return resolve(ress)
              })
            })
          })
        })
        break
    }
  })
}
