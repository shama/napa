import cache from 'npm-cache-filename'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import Promise from 'bluebird'
import tar from 'tar-pack'

const tmp = path.join(require('os').tmpdir(), 'napa_cache')

export default class {
  constructor (url, opts) {
    const cwd = opts.cwd || process.cwd()

    this.cacheTo = cache(
      typeof opts['cache-path'] !== 'string'
        ? tmp
        : path.resolve(cwd, opts['cache-path']),
      url
    )
  }

  get exists () {
    return fs.existsSync(this.cacheTo)
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
        const cName = (typeof this.cacheTo === 'string' && this.cacheTo.indexOf('.tar.gz') === -1) ? this.cacheTo + '.tar.gz' : this.cacheTo
        tar.pack(saveFrom, { ignoreFiles: [] })
          .pipe(fs.createWriteStream(cName))
          .on('close', (err) => err ? reject(err) : resolve())
      })
    })
  }
}
