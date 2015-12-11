'use strict'

const test = require('tape')
const fs = require('fs')
// Testing promise
const tfunc = require('./func')

test('Pkg_load_package', (t) => {
  t.plan(5)

  tfunc('load user/repo').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'master'], 'user/repo'))
  tfunc('load https://github.com/user/repo:testing').then((res) => t.deepEqual(res, ['https://github.com/user/repo', 'testing', 'master'], 'https://github.com/user/repo:testing'))
  tfunc('load git://github.com/user/repo2').then((res) => t.deepEqual(res, ['git://github.com/user/repo2', 'repo2', 'master'], 'git://github.com/user/repo2'))
  // when developing on windows, this returns zip, linux is tar.gz
  tfunc('load angular/angular.js#v1.2.3:angular').then((res) => t.deepEqual(res, ['https://github.com/angular/angular.js/archive/v1.2.3.' + ((process.platform === 'win32') ? 'zip' : 'tar.gz'), 'angular', 'v1.2.3'], 'angular/angular.js#v1.2.3:angular'))
  tfunc('load https://github.com/angular/angular.js/archive/master.zip:angular').then((res) => t.deepEqual(res, ['https://github.com/angular/angular.js/archive/master.zip', 'angular', 'master'], 'https://github.com/angular/angular.js/archive/master.zip:angular'))
})

test('Pkg_install_by_archive', (t) => {
  t.plan(5)

  tfunc('install https://github.com/orbweaver-/test_napa/archive/master.tar.gz:test_napa').then(function (pkg) {
    t.ok(fs.existsSync(pkg.installTo), 'file was installed to node_modules')
    t.ok(pkg.isInstalled, 'pkg says it was installed')
    t.ok(fs.existsSync(pkg.cache.cacheTo), 'file was cached')
    t.ok(pkg.useCache, 'pkg says it was cached')
    const tn = require('test_napa')
    t.ok(tn.complete, 'Module imported')
  })
})
