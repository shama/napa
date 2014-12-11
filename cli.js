var path = require('path')
var fs = require('fs')
var cwd = process.cwd()
var Pkg = require('./lib/pkg')
var nopt = require("nopt")

var napa = module.exports = {}

napa.knownOpts = {
  cache: Boolean,
  force: Boolean,
  pkg: Boolean
};
napa.shortOpts = {
  c: ['--cache'],
  C: ['--no-cache'],
  f: ['--force'],
  F: ['--no-force'],
  p: ['--pkg'],
  P: ['--no-pkg']
};
napa.defaultOpts = require('./config.js')


napa.cli = function(params, done) {
  var total = 0
  function close() {
    if (total < 1) return done()
    total--
  }

  var config = napa.config(params),
      pkg, args;

  if (config.opts.pkg) {
    pkg = napa.readpkg()
  }

  if (pkg) {
    args = config.args.map(napa.args).concat(pkg)
  } else {
    args = config.args.map(napa.args)
  }

  args.forEach(function(cmd) {
    total++
    var pkg = new Pkg(cmd[0], cmd[1], {ref: cmd[2], exec: config.opts})
    pkg.install(close)
  })
}

napa.config = function(args){
  /* parse args to separate options and real args */
  var opts = nopt(napa.knownOpts, napa.shortOpts, args || [], 0);
  for (var i in napa.defaultOpts) {
    if (!opts.hasOwnProperty(i)){
      opts[i] = napa.defaultOpts[i];
    }
  };
  return  {
    args: opts.argv.remain,
    opts: opts
  }
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
