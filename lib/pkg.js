'use strict'

const fs = require('fs')
const path = require('path')
const log = require('npmlog')
const rimraf = require('rimraf')
const Promise = require('bluebird')
const spawn = require('child_process').spawn
const git = require('./git')
const NapaCache = require('./cache')
const archive = require('./archive')

class NapaPkg {
  constructor (location, name, opts) {
    opts = opts || {}

    this._napaGitRefKey = '_napaGitRef'
    this._napaResolvedKey = '_napaResolved'

    this.cwd = opts.cwd || process.cwd()
    this.log = opts.log || log
    this.location = location
    this.name = name
    this.modulesDir = path.join(this.cwd, 'napa_modules')
    this.installTo = path.join(this.modulesDir, this.name)

    this.useCache = (typeof opts.cache === 'undefined') || opts.cache !== false
    if (this.useCache) {
      this.cache = new NapaCache(this.url, opts)
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
      return pkgJSON[this._napaResolvedKey] === this.url
    }
  }

  get isGitRepo () {
    return git.urlIsRepo(this.url)
  }

  get ref () {
    return this.location.replace(/^[^#]*#?/, '') || 'master'
  }

  get url () {
    let url = this.location

    if (typeof url !== 'string') {
      if (url.url) url = url.url
      else return false
    }

    if (url.indexOf('#') !== -1) {
      if (url.indexOf('://') === -1) {
        const userRepo = url.split('#')[0]
        url = 'https://github.com/' + userRepo
      } else {
        url = url.split('#')[0]
      }
    }

    if (url.slice(0, 1) === '/') {
      url = url.slice(1)
    }

    if (url.indexOf('git@') !== -1) {
      url = 'https://' + url.split('@')[1].replace(':', '/')
    }

    if (url.indexOf('://') === -1 && url.indexOf('@') === -1) {
      url = 'git://github.com/' + url
    }

    return url
  }

  get installMethod () {
    if (this.useCache && this.cache.exists()) {
      return 'cache'
    } else if (this.isGitRepo) {
      return 'git'
    } else {
      return 'download'
    }
  }

  install (done) {
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
          case 'download': return archive.install(this.url, this.installTo)
          case 'git': return git.clone(this.installTo, this.url)
            .then(() => git.enableShallowCloneBranches(this.installTo))
            .then(() => git.fetch(this.installTo, this.ref))
            .then(() => git.checkout(this.installTo, this.ref))
        }
      })()
        .then(() => this.writePackageJSON())
        .then(() => this.saveToNodeModules())
        .then(() =>
          this.log.info(
            'napa',
            `${this.name}@${this.ref} ${path.relative(process.cwd(), this.installTo)}`
        ))
        .then(() =>
          this.useCache && this.isInstalled
            ? this.cache.save(this.installTo)
            : Promise.resolve())
        .catch((err) => {
          rimraf.sync(this.installTo)
          log.error('napa', 'Error installing', this.name, '\n', err.toString())
        })
    }
  }

  update () {
    return (() => {
      switch (this.installMethod) {
        case 'cache': return this.cache.install(this.installTo)
        case 'download': return archive.install(this.url, this.installTo)
        case 'git': return git.fetch(this.installTo, this.ref)
          .then(() => git.checkout(this.installTo, this.ref))
      }
    })()
      .then(() => this.writePackageJSON())
      .then(() => this.saveToNodeModules())
      .then(() =>
        this.log.info(
          'napa',
          `${this.name}@${this.ref} ${path.relative(process.cwd(), this.installTo)}`
      ))
      .then(() =>
        this.useCache && this.isInstalled
          ? this.cache.save(this.installTo)
          : Promise.resolve())
      .catch((err) => {
        rimraf.sync(this.installTo)
        log.error('napa', 'Error updating', this.name, '\n', err.toString())
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

    pkg[this._napaResolvedKey] = this.url
    pkg[this._napaGitRefKey] = this.ref

    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, JSON.stringify(pkg, null, 2), (err) =>
        err ? reject(err) : resolve())
    })
  }

  saveToNodeModules () {
    const npm = spawn('npm', ['install', '--save-optional', `file:${this.installTo}`])

    return new Promise((resolve, reject) => {
      npm.stderr.on('data', (err) => reject(err.toString()))
      npm.on('close', (code) => {
        if (code === 0) {
          resolve()
        }
      })
    })
  }
}

module.exports = NapaPkg
