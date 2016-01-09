const test = require('tape')
// Testing promise
const tfunc = require('./func')

test('git_install', (t) => {
  t.plan(6)

  tfunc.install('orbweaver-/test_napa').then((r) => {
    t.ok((r.cleanInstall && r.cleanCache), 'Started with clean installation')
    t.equal(r.type, 'git', 'It is a git download')
    t.ok(r.installed, 'package was installed')
    t.ok((r.useCache && r.cached), 'package was cached')
    t.ok(r.package.complete, 'Module imported')
    t.ok(r.cleaned, 'installation and cache was cleaned up')
  })
})

// NOTE: node/git does not like it if you install these two tests with the same name. Unclear as to why...
test('git_install_different_branch', (t) => {
  t.plan(7)

  tfunc.install('orbweaver-/test_napa#other:test_napa_other').then((r) => {
    t.ok((r.cleanInstall && r.cleanCache), 'Started with clean installation')
    t.equal(r.type, 'git', 'It is a git download')
    t.ok(r.installed, 'package was installed')
    t.ok((r.useCache && r.cached), 'package was cached')
    t.ok(r.package.other, 'Other branch cloned')
    t.ok(r.package.complete, 'Module imported')
    t.ok(r.cleaned, 'installation and cache was cleaned up')
  })
})
