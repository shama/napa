'use strict'

const test = require('tape')
const tfunc = require('./func')

test('Pkg_load_package', (t) => {
  t.plan(5)

  tfunc.load('user/repo').then((r) => t.equal(r, 'git', 'user/repo: git'))
  tfunc.load('https://github.com/user/repo').then((r) => t.equal(r, 'git', 'https://github.com/user/repo: git'))
  tfunc.load('git://github.com/user/repo').then((r) => t.equal(r, 'git', 'git://github.com/user/repo: git'))
  tfunc.load('user/repo#tags/tagName').then((r) => t.equal(r, 'download', 'user/repo#tags/tagName: download'))
  tfunc.load('https://github.com/user/repo/archive/tagName.zip').then((r) => t.equal(r, 'download', 'https://github.com/user/repo/archive/tagName.zip: download'))
})
