var path = require('path')
var fs = require('fs')
var cwd = process.cwd()
var Pkg = require('./lib/pkg')
var nopt = require("nopt")

var knownOpts = {
  cache: Boolean,
  force: Boolean
};
var shortOpts = {
  c: ['--cache'],
  C: ['--no-cache'],
  f: ['--force'],
  F: ['--no-force']
};
var defaultOpts =  {
  cache: true,
  force: false
};

var napa = module.exports = {}

napa.cli = function(args, done) {
  var total = 0
  function close() {
    if (total < 1) return done()
    total--
  }

  /* parse process.argv to get options, like --no-cache, ... */
  var execOpts = nopt(knownOpts, shortOpts, process.argv, 2);
  for (var i in defaultOpts) {
    if (!execOpts.hasOwnProperty(i)){
      execOpts[i] = defaultOpts[i];
    }
  };
  args = execOpts.argv.remain;

  var pkg;
  /* check package.json only if no arg */
  if (0 === args.length) {
    pkg = napa.readpkg()
  }

  if (pkg) {
    args = args.map(napa.args).concat(pkg)
  } else {
    args = args.map(napa.args)
  }

  args.forEach(function(cmd) {
    total++
    var pkg = new Pkg(cmd[0], cmd[1], {ref: cmd[2], exec: execOpts})
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
