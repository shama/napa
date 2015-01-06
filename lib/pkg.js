var path = require('path')
var fs = require('fs')
var spawn = require('child_process').spawn
var cache = require('npm-cache-filename')
var log = require('npmlog')
var rimraf = require('rimraf')
var Download = require('download')
var tmp = path.join(require('os').tmpdir(), 'cache')
var mkdirp = require('mkdirp')
var pack = require('tar-pack').pack
var unpack = require('tar-pack').unpack

function NapaPkg(url, name, opts) {
  if (!(this instanceof NapaPkg)) return new NapaPkg(url, name, opts)
  var self = this
  opts = opts || {}
  this.cwd = opts.cwd || process.cwd()
  this.log = opts.log || log
  this._mock = opts._mock
  this.ref = opts.ref
  this.url = url
  this.name = name
  this.installTo = path.join(this.cwd, 'node_modules', this.name)
  this.cacheTo = cache(tmp, this.url)
  this._napaResolvedKey = '_napaResolved'

  Object.defineProperty(self, 'installed', {
    get: function() {
      var existing = path.join(self.installTo, 'package.json')
      return (fs.existsSync(existing) && require(existing)[self._napaResolvedKey] === url)
    }
  })
  Object.defineProperty(self, 'cached', {
    get: function() { return fs.existsSync(self.cacheTo) }
  })
}
module.exports = NapaPkg

NapaPkg.prototype.install = function(done) {
  var self = this, cbCalled = false
  done = done || function() {}

  // Do nothing if already installed
  if (self.installed) return done()

  function cb(err) {
    if (err) return done(err.message)
    self.writePackageJson(function(err) {
      if (err) return done(err.message)
      self.cache(done)
    })
  }

  function cacheInstall() {
    if (typeof self._mock === 'function') {
      self._mock(['cache', self.url, self.name])
    } else {
      self.log.info('cache', '%s into %s', self.url, self.name)
      fs.createReadStream(self.cacheTo)
        .pipe(unpack(self.installTo, cb))
    }
  }

  function gitInstall() {
    var args = ['clone', '--depth', '1', '-q', (self.url.replace('git+', '')), self.installTo]
    var cmd = ['git', args]
    if (self.ref) args.splice(1, 2)
    if (typeof self._mock === 'function') {
      self._mock(cmd)
    } else {
      self.log.info('git', '%s into %s', self.url, self.name)
      var git = spawn.apply(spawn, cmd)
      git.stderr.on('data', log.error)
      git.on('close', function(code, signal){
        var checkout
        if (code) return cb(code, signal)
        if (self.ref) {
          checkout = spawn('git', ['checkout', self.ref], {cwd: self.installTo})
          checkout.stderr.on('data', log.info)
          checkout.on('close', cb)
        }
      })
    }
  }

  function downloadInstall() {
    if (typeof self._mock === 'function') {
      self._mock(['download', self.url, self.installTo])
    } else {
      self.log.info('download', '%s into %s', self.url, self.name)
      new Download({ extract: true, strip: 1 })
        .get(self.url)
        .dest(self.installTo)
        .run(cb)
    }
  }

  // is this a git repo url?
  var gitUrls = ['git+', 'git://']

  // Determine which type of install we would like
  rimraf(self.installTo, function(err) {
    if (err) log.error(err.message)
    if (fs.existsSync(self.cacheTo)) {
      return cacheInstall()
    } else if (gitUrls.indexOf(self.url.slice(0, 4)) !== -1) {
      return gitInstall()
    } else {
      if (self.url.indexOf('github.com') !== -1 && self.url.indexOf('/archive/') === -1) {
        return gitInstall()
      }
      return downloadInstall()
    }
  })
}

// Caches a locally installed package
NapaPkg.prototype.cache = function(done) {
  var self = this
  if (!this.installed) return done()
  mkdirp(path.dirname(self.cacheTo), function(err) {
    if (err) return done(err)
    var dest = fs.createWriteStream(self.cacheTo)
    pack(self.installTo, {ignoreFiles: []})
      .pipe(dest)
      .on('close', done)
  })
}

// TODO: Replace this with metamorph and ability to override
NapaPkg.prototype.writePackageJson = function(done) {
  var filepath = path.join(this.installTo, 'package.json')
  var pkg = null
  if (!fs.existsSync(filepath)) {
    pkg = {
      name: this.name,
      version: '0.0.0',
      description: ''
    }
  } else {
    pkg = require(filepath)
  }
  pkg[this._napaResolvedKey] = this.url
  fs.writeFile(filepath, JSON.stringify(pkg, null, 2), done)
}
