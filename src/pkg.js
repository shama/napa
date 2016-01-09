import fs from 'fs'
import path from 'path'
import log from 'npmlog'
import rimraf from 'rimraf'
import Promise from 'bluebird'
import * as archive from './archive'
import * as git from './git'
import NapaCache from './cache'
import cl from './cl'

export default class {
  constructor (location, name, ref = 'master', opts = {}) {
    this._napaGitRefKey = '_napaGitRef'
    this._napaResolvedKey = '_napaResolved'

    this.cwd = opts.cwd || process.cwd()
    this.log = opts.log || log
    this.location = location
    this.name = name
    this.ref = ref
    this.modulesDir = path.join(this.cwd, 'napa_modules')
    this.installTo = path.join(this.modulesDir, this.name)

    this.useCache = (typeof opts.cache === 'undefined') || opts.cache !== false
    if (this.useCache) {
      this.cache = new NapaCache(this.location, opts)
    }

    if (this.useCache && this.cache.exists) {
      this.installMethod = 'cache'
    } else if (this.isGitRepo) {
      this.installMethod = 'git'
    } else {
      this.installMethod = 'download'
    }
  }

  get isInstalled () {
    const existing = path.join(this.installTo, 'package.json')
    return fs.existsSync(existing)
  }

  get isCorrectVersion () {
    const pkgJSON = require(path.join(this.installTo, 'package.json'))

    if (this.isGitRepo) {
      return pkgJSON[this._napaGitRefKey] === this.ref
    } else {
      return pkgJSON[this._napaResolvedKey] === this.location
    }
  }

  get isGitRepo () {
    return git.urlIsRepo(this.location)
  }

  install (done) {
    log.info('napa', `INSTALLING: ${this.location}`)
    if (this.isInstalled) {
      if (this.isCorrectVersion) {
        return Promise.resolve()
      } else {
        return this.update()
      }
    } else {
      return (() => {
        switch (this.installMethod) {
          case 'cache': return this.cache.install(this.installTo)
          case 'download': return archive.install(this.location.slice(this.location.lastIndexOf('/') + 1), this.location, this.cwd, this.installTo, this.useCache, this.cache.cacheTo.slice(0, this.cache.cacheTo.lastIndexOf('/')))
          case 'git': return git.clone(this.installTo, this.location, this.ref)
              .then(() => git.enableShallowCloneBranches(this.installTo))
              .then(() => git.fetch(this.installTo, this.ref))
        }
      })()
        .then(() => this.writePackageJSON())
        .then(() => this.saveToNodeModules())
        .then(() => this.log.info(
            'napa',
            `${this.name}@${this.ref} ${path.relative(process.cwd(), this.installTo)}`
        ))
        .then(() => {
          if (this.useCache && this.isInstalled && this.installMethod !== 'download') {
            return this.cache.save(this.installTo).then(() => {
              return Promise.resolve(this)
            })
          } else {
            return Promise.resolve(this)
          }
        })
        .catch((err) => {
          rimraf.sync(this.installTo)
          this.log.error('napa', 'Error installing', this.name, '\n', err.toString())
        })
    }
  }

  update () {
    return (() => {
      switch (this.installMethod) {
        case 'cache': return this.cache.install(this.installTo)
        case 'download': return archive.install(this.location, this.installTo)
        case 'git': return git.fetch(this.installTo, this.ref)
            .then(() => git.checkout(this.installTo, this.ref))
      }
    })()
      .then(() => this.writePackageJSON())
      .then(() => this.saveToNodeModules())
      .then(() => {
        this.log.info(
          'napa',
          `${this.name}@${this.ref} ${path.relative(process.cwd(), this.installTo)}`
      )
      })

      .then(() => this.useCache && this.isInstalled
          ? this.cache.save(this.installTo)
          : Promise.resolve()
        )

      .catch((err) => {
        rimraf.sync(this.installTo)
        this.log.error('napa', 'Error updating', this.name, '\n', err.toString())
      })
  }

  writePackageJSON () {
    const filepath = path.join(this.installTo, 'package.json')
    let pkg = {}

    if (fs.existsSync(filepath)) {
      pkg = require(filepath)
    }

    pkg.name = pkg.name || this.name
    pkg.version = pkg.version || '0.0.0'
    pkg.description = pkg.description || '-'
    pkg.repository = pkg.repository || { type: 'git', url: '-' }
    pkg.readme = pkg.readme || '-'
    pkg.main = 'index.js'
    pkg.author = ''

    pkg[this._napaResolvedKey] = this.location
    pkg[this._napaGitRefKey] = this.ref

    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, JSON.stringify(pkg, null, 2), (err) => err ? reject(err) : resolve())
    })
  }

  saveToNodeModules () {
    return cl('npm', ['install', '--save-optional', `file:${this.installTo}`])
  }
}
