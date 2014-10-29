var napa = require('./cli.js')
var Pkg = require('./lib/pkg')
var test = require('tape')
var path = require('path')
var fs = require('fs')
var rimraf = require('rimraf')

function clean(filepaths, done) {
  var count = filepaths.length
  function cb() {
    count--
    if (count < 1) process.nextTick(done)
  }
  for (var i = 0; i < filepaths.length; i++) {
     rimraf(filepaths[i], cb)
  }
}

test('args', function(t) {
  t.plan(5)
  t.deepEqual(napa.args('user/repo'), ['git://github.com/user/repo', 'repo', ''])
  t.deepEqual(napa.args('https://github.com/user/repo:testing'), ['https://github.com/user/repo', 'testing', ''])
  t.deepEqual(napa.args('git://github.com/user/repo2'), ['git://github.com/user/repo2', 'repo2', ''])
  // when developing on windows, this returns zip, linux is tar.gz
  t.deepEqual(napa.args('angular/angular.js#v1.2.3:angular'), ['https://github.com/angular/angular.js/archive/v1.2.3.' + ((process.platform === 'win32') ? 'zip' : 'tar.gz'), 'angular', 'v1.2.3:angular'])
  t.deepEqual(napa.args('https://github.com/angular/angular.js/archive/master.zip:angular'), ['https://github.com/angular/angular.js/archive/master.zip', 'angular', ''])
})

test('cmds', function(t) {
  t.plan(7)
  var testPath = path.resolve('node_modules', 'test')
  var pkg = null

  function assertPkg(url, name, cb) {
    pkg = new Pkg(url, name, { _mock: cb })
    pkg.install()
  }

  // if github is in the url then its treated like a git+ url
  assertPkg('git://github.com/user/repo', 'test', function(result) {
    t.deepEqual(result, ['git', ['clone', '--depth', '1', '-q', 'git://github.com/user/repo', testPath]])
  })
  assertPkg('https://github.com/user/repo', 'test', function(result) {
    t.deepEqual(result, ['git', ['clone', '--depth', '1', '-q', 'https://github.com/user/repo', testPath]])
  })

  // git+ works like npm install see https://www.npmjs.org/doc/cli/npm-install.html
  assertPkg('git+http://test.com/user/repo', 'test', function(result) {
    t.deepEqual(result, ['git', ['clone', '--depth', '1', '-q', 'http://test.com/user/repo', testPath]])
  })
  assertPkg('git+https://test.com/user/repo', 'test', function(result) {
    t.deepEqual(result, ['git', ['clone', '--depth', '1', '-q', 'https://test.com/user/repo', testPath]])
  })
  assertPkg('git+ssh://test.com/user/repo', 'test', function(result) {
    t.deepEqual(result, ['git', ['clone', '--depth', '1', '-q', 'ssh://test.com/user/repo', testPath]])
  })

  // download
  assertPkg('ssh://test.com/user/repo', 'test', function(result) {
    t.deepEqual(result, ['download', 'ssh://test.com/user/repo', testPath])
  })
  assertPkg('https://github.com/angular/angular.js/archive/master.zip', 'angular', function(result) {
    t.deepEqual(result, ['download', 'https://github.com/angular/angular.js/archive/master.zip', path.resolve('node_modules', 'angular')])
  })
})

test('readpkg', function(t) {
  t.plan(1)
  var actual = napa.readpkg()
  var expected = [
    ['git://github.com/foo/repo', 'foo', ''],
    ['https://github.com/emberjs/ember.js/archive/v1.7.0.tar.gz', 'ember', ''],
    ['git://github.com/components/handlebars.js', 'handlebars', ''],
  ]
  t.deepEqual(actual, expected)
})

test('pkg install', function(t) {
  t.plan(8)
  var url = 'https://github.com/emberjs/ember.js/archive/v1.7.0.tar.gz'
  var pkgName = 'ember'
  var pkg = new Pkg(url, pkgName)
  clean([pkg.cacheTo, pkg.installTo], function() {
    pkg.install(function() {
      t.ok(fs.existsSync(pkg.installTo), 'file was installed to node_modules')
      t.ok(pkg.installed, 'pkg says it was installed')
      t.ok(fs.existsSync(pkg.cacheTo), 'file was cached')
      t.ok(pkg.cached, 'pkg says it was cached')
      // Delete pkg and install again
      clean([pkg.installTo], function() {
        pkg = new Pkg(url, pkgName)
        t.ok(!pkg.installed, 'pkg says not installed after deleted')
        t.ok(fs.existsSync(pkg.cacheTo), 'pkg deleted but cache remains')
        pkg.install(function() {
          t.ok(fs.existsSync(pkg.installTo), 'pkg installed from cache')
          t.ok(pkg.installed, 'pkg says installed when from cache')
        })
      })
    })
  })
})

test('pkg install different version', function(t) {
  t.plan(2)
  var result = null
  var pkg = new Pkg('https://github.com/emberjs/ember.js/archive/v1.6.0.tar.gz', 'ember')
  pkg.install(function() {
    result = require(path.resolve(pkg.installTo, 'package.json'))[pkg._napaResolvedKey]
    t.equal(result, 'https://github.com/emberjs/ember.js/archive/v1.6.0.tar.gz', 'should have installed the older version')

    pkg = new Pkg('https://github.com/emberjs/ember.js/archive/v1.7.0.tar.gz', 'ember')
    pkg.install(function() {
      result = require(path.resolve(pkg.installTo, 'package.json'))[pkg._napaResolvedKey]
      t.equal(result, 'https://github.com/emberjs/ember.js/archive/v1.7.0.tar.gz', 'should have installed the newer version')
    })
  })
})

test('pkg install with ref', function(t) {
  t.plan(1)
  var result = null
  var pkg = new Pkg('https://github.com/twbs/bootstrap', 'bootstrap', {ref: 'v3.3.0'})

  clean([pkg.cacheTo, pkg.installTo], function() {
    pkg.install(function(err) {
      t.notOk(err, 'no error should occur')
    })
  })
})
