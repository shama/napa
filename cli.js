var path = require('path')
var fs = require('fs')
var cwd = process.cwd()
var Pkg = require('./lib/pkg')

var napa = module.exports = {}

napa.cli = function(args, done) {
  done = done || function() {}
  var total = 0
  function close() {
    total--
    if (total < 1) return done()
  }
  pkg = napa.readpkg()
  if (pkg) args = args.map(napa.args).concat(pkg)
  else args = args.map(napa.args)
  args.forEach(function(cmd) {
    total++
    var pkg = new Pkg(cmd[0], cmd[1], {ref: cmd[2]})
    pkg.install(close)
  })
}

napa.args = function(str) {
  var url, name
  var split = str.split(':')
  if (split.length === 3) {
    name = split[2]
    url = split.slice(0, 2).join(':')
  } else if (split.length === 2) {
    if (split[1].slice(0, 2) === '//') {
      url = split.join(':')
    } else {
      url = split[0]
      name = split[1]
    }
  } else {
    url = split.join(':')
  }

  if (!name) name = url.slice(url.lastIndexOf('/') + 1)
  return [napa.url(url), name, napa.getref(str)]
}

napa.url = function(url) {
  if (typeof url !== 'string') {
    if (url.url) url = url.url
    else return false
  }
  if (url.indexOf('#') !== -1) {
    if (url.indexOf('://') === -1) {
      var s = url.split('#')
      url = 'https://github.com/' + s[0] + '/archive/' + s[1]
      if (process.platform === 'win32') url += '.zip'
      else url += '.tar.gz'
    } else {
      url = url.replace(/#.*?$/, '')
    }
  }
  if (url.slice(0, 1) === '/') url = url.slice(1)
  if (url.indexOf('://') === -1) url = 'git://github.com/' + url
  return url
}

napa.readpkg = function() {
  pkg = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkg)) return false
  pkg = require(pkg)
  if (!pkg.hasOwnProperty('napa')) return false
  return Object.keys(pkg.napa).map(function(key) {
    return [napa.url(pkg.napa[key]), key, napa.getref(pkg.napa[key])]
  })
}

napa.getref = function(url) {
  return url.replace(/^[^#]*#?/, '')
}
