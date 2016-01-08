'use strict'

const Promise = require('bluebird')
const cli = require('../../lib/cli')
const Pkg = require('../../lib/pkg').default
const rimraf = require('rimraf')
const fs = require('fs')

const clean = function (filepaths, done) {
  if (filepaths.length < 1) return process.nextTick(done)
  let count = filepaths.length
  function cb () {
    count--
    if (count < 1) process.nextTick(done)
  }
  for (let i = 0; i < filepaths.length; i++) {
    rimraf(filepaths[i], cb)
  }
}

function installPkg (deletePaths, url, cb) {
  const args = cli.parseArgs(url)
  const pk = new Pkg(args[0], args[1], args[2])
  let dPaths = []
  if (deletePaths[0] === 'cache' || deletePaths[1] === 'cache') dPaths.push(pk.cache.cacheTo)
  if (deletePaths[0] === 'install' || deletePaths[1] === 'install') dPaths.push(pk.installTo)
  clean(dPaths, function () {
    let obj = {
      installTo: pk.installTo,
      cacheTo: pk.cache.packageName,
      cleanInstall: !fs.existsSync(pk.installTo),
      cleanCache: !fs.existsSync(pk.cache.packageName),
      type: pk.installMethod
    }
    pk.install().then(function (p) {
      obj.installed = fs.existsSync(p.installTo)
      obj.cached = fs.existsSync(p.cache.packageName)
      obj.useCache = p.useCache
      obj.package = require(p.name)
      return cb(obj)
    })
  })
}

module.exports = {
  parse: function (url) {
    return new Promise(function (resolve, reject) {
      const args = cli.parseArgs(url)
      return resolve(args)
    })
  },

  load: function (url) {
    return new Promise(function (resolve, reject) {
      const args = cli.parseArgs(url)
      const pk = new Pkg(args[0], args[1], args[2])
      return resolve(pk.installMethod)
    })
  },

  install: function (url) {
    return new Promise(function (resolve, reject) {
      installPkg(['cache', 'install'], url, function (obj) {
        clean([obj.installTo, obj.cacheTo], function () {
          obj.cleaned = !fs.existsSync(obj.installTo) && !fs.existsSync(obj.cacheTo)
          return resolve(obj)
        })
      })
    })
  },

  cache: function (url) {
    return new Promise(function (resolve, reject) {
      installPkg(['cache', 'install'], url, function (pk1) {
        clean([pk1.installTo], function () {
          pk1.installCleaned = !fs.existsSync(pk1.installTo)
          installPkg(['', ''], url, function (pk2) {
            pk2.installCleaned = pk1.installCleaned
            pk2.cleanInstall = pk1.cleanInstall
            pk2.cleanCache = pk1.cleanCache
            clean([pk2.installTo, pk2.cacheTo], function () {
              pk2.cleaned = !fs.existsSync(pk2.installTo) && !fs.existsSync(pk2.cacheTo)
              return resolve(pk2)
            })
          })
        })
      })
    })
  }
}

/*
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
*/
