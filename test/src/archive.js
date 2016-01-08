'use strict'

const test = require('tape')
const tfunc = require('./func')

test('Archive_install', (t) => {
  t.plan(6)

  tfunc.install('orbweaver-/test_napa#tags/master').then((r) => {
    t.ok((r.cleanInstall && r.cleanCache), 'Started with clean installation')
    t.equal(r.type, 'download', 'It is an archive download')
    t.ok(r.installed, 'package was installed')
    t.ok((r.useCache && r.cached), 'package was cached')
    t.ok(r.package.complete, 'Module imported')
    t.ok(r.cleaned, 'installation and cache was cleaned up')
  })
})

test('Archive_install_full_url', (t) => {
  t.plan(6)

  tfunc.install('https://github.com/orbweaver-/test_napa/archive/master.tar.gz').then((r) => {
    t.ok((r.cleanInstall && r.cleanCache), 'Started with clean installation')
    t.equal(r.type, 'download', 'It is an archive download')
    t.ok(r.installed, 'package was installed')
    t.ok((r.useCache && r.cached), 'package was cached')
    t.ok(r.package.complete, 'Module imported')
    t.ok(r.cleaned, 'installation and cache was cleaned up')
  })
})
