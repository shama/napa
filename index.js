var spawn = require('child_process').spawn
var path = require('path')
var fs = require('fs')
var log = require('npmlog')
var rimraf = require('rimraf')
var download = require('download')
var cwd = process.cwd()

var napa = module.exports = {}

napa.cli = function(args, done) {
  var total = 0
  function close() {
    if (total < 1) return done()
    total--
  }
  pkg = napa.readpkg()
  if (pkg) args = args.map(napa.args).concat(pkg)
  else args = args.map(napa.args)
  args.map(napa.cmd).forEach(function(cmd) {
    total++
    log.info('install', '%s into %s', cmd[cmd.length-2], path.relative(cwd, cmd[cmd.length-1]))
    rimraf(cmd[cmd.length-1], function(err) {
      if (err) return log.error(err)
      if (cmd[0] === 'git') {
        // Download with git
        cmd.push('-q')
        var git = spawn(cmd[0], cmd.slice(1))
        git.stderr.on('data', log.error)
        git.on('close', close)
      } else {
        // Download with download
        var d = download(cmd[1], cmd[2], { extract: true, strip: 1 })
        d.on('error', log.error)
        d.on('close', close)
      }
    })
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
  return [napa.url(url), name]
}

napa.url = function(url) {
  if (url.indexOf('#') !== -1 && url.indexOf('://') === -1) {
    var s = url.split('#')
    url = 'https://github.com/' + s[0] + '/archive/' + s[1]
    if (process.platform === 'win32') url += '.zip'
    else url += '.tar.gz'
  }
  if (url.slice(0, 1) === '/') url = url.slice(1)
  if (url.indexOf('://') === -1) url = 'git://github.com/' + url
  return url
}

napa.cmd = function(repo) {
  var outpath = path.join(cwd, 'node_modules', repo[1])
  if (repo[0].slice(0, 6) === 'git://') {
    return ['git', 'clone', '--depth', '1', repo[0], outpath]
  } else {
    if (repo[0].indexOf('github.com') !== -1 && repo[0].indexOf('/archive/') === -1) {
      return ['git', 'clone', '--depth', '1', repo[0], outpath]
    }
    return ['download', repo[0], outpath]
  }
}

napa.readpkg = function() {
  pkg = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkg)) return false
  pkg = require(pkg)
  if (!pkg.hasOwnProperty('napa')) return false
  return Object.keys(pkg.napa).map(function(key) {
    return [napa.url(pkg.napa[key]), key]
  })
}
