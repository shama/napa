var path = require('path')
var fs = require('fs')
var cwd = process.cwd()
var Pkg = require('./lib/pkg')
var nopt = require('nopt')
var url = require('url-parse')
var path = require('path')
var slash = require('slash')

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
    config.args = config.args.concat(pkg)
  }
  args = config.args.map(napa.args)

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

napa.args = function(str){
  var parsed = url(str);
  var parsedPath, name, version;

  //get module final name and version !
    // get name and version in parsed.hash (if version is provided)
    if ('' !== parsed.hash) {
      parsedPath = parsed.hash.match(/(.*):(.*)/)
      if (parsedPath) {
        name = parsedPath[2];
        version = parsedPath[1].slice(1);
      } else {
        version = parsed.hash.slice(1);
      }
      parsed.set('hash', '');
    // else, get name in parsed.pathname
    } else {
      parsedPath = parsed.pathname.match(/(.*):(.*)/)
      if (parsedPath) {
        name = parsedPath[2];
        parsed.set('pathname', parsedPath[1])
      }
    }
    // if !name, get it from parsed.pathname
    if (!name){
      name = path.basename(parsed.pathname);
    }

  //set full pathname if there is no hostname
    if ('' === parsed.hostname){
      parsed.set('host', 'github.com')
      parsed.set('hostname', 'github.com')
      parsed.set('protocol', 'git:')
      parsed.set('pathname', slash(path.join('/', parsed.pathname))) // to deal with first slash
      if (!!version){
        parsed.set('protocol', 'https:')
        parsed.set('pathname', slash(path.join(parsed.pathname, 'archive', version + (process.platform === 'win32' ? '.zip' : '.tar.gz' ))))
      }
    }

  return [parsed.toString(), name, version || '']

}

napa.readpkg = function() {
  pkg = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkg)) return false
  pkg = require(pkg)
  if (!pkg.hasOwnProperty('napa')) return false
  return Object.keys(pkg.napa).map(function(key) {
    return pkg.napa[key]+':'+key
  })
}
