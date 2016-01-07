'use strict'

const test = require('tape')
const tfunc = require('./func')

test('Cache_install_archive', (t) => {
  t.plan(7)

  tfunc.cache('orbweaver-/test_napa#tags/master').then((r) => {
    t.ok((r.cleanInstall && r.cleanCache), 'Started with clean installation')
    t.equal(r.type, 'cache', 'Was installed using cache')
    t.ok(r.installCleaned, 'original install was deleted')
    t.ok(r.installed, 'package was installed')
    t.ok((r.useCache && r.cached), 'package was cached')
    t.ok(r.package.complete, 'Module imported')
    t.ok(r.cleaned, 'installation and cache was cleaned up')
  })
})
