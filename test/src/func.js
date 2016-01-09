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
  const dPaths = []
  if (deletePaths[0] === 'cache' || deletePaths[1] === 'cache') dPaths.push(pk.cache.packageName)
  if (deletePaths[0] === 'install' || deletePaths[1] === 'install') dPaths.push(pk.installTo)
  clean(dPaths, function () {
    const obj = {
      installTo: pk.installTo,
      cacheTo: pk.cache.packageName,
      cleanInstall: !fs.existsSync(pk.installTo),
      cleanCache: !fs.existsSync(pk.cache.packageName),
      packageName: pk.cache.packageName,
      type: pk.installMethod
    }
    pk.install().then(function (p) {
      obj.installed = fs.existsSync(p.installTo)
      obj.cached = fs.existsSync(p.cache.packageName)
      obj.useCache = p.useCache
      obj.package = require(`../../napa_modules/${p.name}`)
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
    return new Promise((resolve, reject) => {
      installPkg(['cache', 'install'], url, (obj) => {
        const args = cli.parseArgs(url)
        const pk = new Pkg(args[0], args[1], args[2])
        pk.install().then((r) => {
          clean([obj.installTo, obj.packageName], () => {
            obj.cleaned = !fs.existsSync(obj.installTo) && !fs.existsSync(obj.packageName)
            return resolve(obj)
          })
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
            clean([pk2.installTo, pk2.packageName], function () {
              pk2.cleaned = !fs.existsSync(pk2.installTo) && !fs.existsSync(pk2.packageName)
              return resolve(pk2)
            })
          })
        })
      })
    })
  }
}
