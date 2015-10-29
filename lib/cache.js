'use strict'

const fs = require('fs')
const path = require('path')
const tar = require('tar-pack')
const mkdirp = require('mkdirp')
const Promise = require('bluebird')
const cache = require('npm-cache-filename')
const tmp = path.join(require('os').tmpdir(), 'napa_cache')

class NapaCache {

  constructor (url, opts) {
    const cwd = opts.cwd || process.cwd()

    this.cacheTo = cache(
      typeof opts['cache-path'] !== 'string'
        ? tmp
        : path.resolve(cwd, opts['cache-path']),
      url
    )
  }

  exists () {
    return fs.existsSync(path.join(this.cacheTo, 'package.json'))
  }

  install (installTo) {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.cacheTo)
        .pipe(tar.unpack(installTo, (err) => err ? reject(err) : resolve()))
    })
  }

  save (saveFrom) {
    return new Promise((resolve, reject) => {
      mkdirp(path.dirname(this.cacheTo), (err) => {
        if (err) {
          return reject(err)
        }

        const dest = fs.createWriteStream(this.cacheTo)
        tar.pack(saveFrom, { ignoreFiles: [] })
          .pipe(dest)
          .on('close', (err) => err ? reject(err) : resolve())
      })
    })
  }
}

module.exports = NapaCache
