const test = require('tape')
const fs = require('fs')
// Testing promise
const tfunc = require('./func')

test('Pkg_install_by_cache_git', (t) => {
  t.plan(5)

  tfunc('cache https://github.com/orbweaver-/test_napa.git').then(function (pkg) {
    t.ok(fs.existsSync(pkg.installTo), 'file was installed to node_modules')
    t.ok(pkg.isInstalled, 'pkg says it was installed')
    t.ok(fs.existsSync(pkg.cache.cacheTo), 'file was cached')
    t.ok(pkg.useCache, 'pkg says it was cached')
    const tn = require('test_napa')
    t.ok(tn.complete, 'Module imported')
  })
})

test('Pkg_install_by_cache_archive', (t) => {
  t.plan(5)

  tfunc('cache https://github.com/orbweaver-/test_napa/archive/master.tar.gz:test_napa').then(function (pkg) {
    t.ok(fs.existsSync(pkg.installTo), 'file was installed to node_modules')
    t.ok(pkg.isInstalled, 'pkg says it was installed')
    t.ok(fs.existsSync(pkg.cache.cacheTo), 'file was cached')
    t.ok(pkg.useCache, 'pkg says it was cached')
    const tn = require('test_napa')
    t.ok(tn.complete, 'Module imported')
  })
})
