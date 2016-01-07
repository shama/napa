'use strict'

const test = require('tape')
// const fs = require('fs')
// Testing promise
const tfunc = require('./func')

test('Pkg_load_package', (t) => {
  t.plan(5)

  tfunc.load('user/repo').then((r) => t.equal(r, 'git', 'user/repo: git'))
  tfunc.load('https://github.com/user/repo').then((r) => t.equal(r, 'git', 'https://github.com/user/repo: git'))
  tfunc.load('git://github.com/user/repo').then((r) => t.equal(r, 'git', 'git://github.com/user/repo: git'))
  tfunc.load('user/repo#tags/tagName').then((r) => t.equal(r, 'download', 'user/repo#tags/tagName: download'))
  tfunc.load('https://github.com/user/repo/archive/tagName.zip').then((r) => t.equal(r, 'download', 'https://github.com/user/repo/archive/tagName.zip: download'))
})
/*
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
*/
