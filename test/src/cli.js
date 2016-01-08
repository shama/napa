'use strict'

const test = require('tape')
const tfunc = require('./func')
const cli = require('../../lib/cli')
const fs = require('fs')
const rimraf = require('rimraf')

const clean = function (filepaths, done) {
  let count = filepaths.length
  function cb () {
    count--
    if (count < 1) process.nextTick(done)
  }
  for (let i = 0; i < filepaths.length; i++) {
    rimraf(filepaths[i], cb)
  }
}

test('CLI_parse_args', (t) => {
  t.plan(17)

  tfunc.parse('user/repo').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'master'], 'user/repo'))
  tfunc.parse('user/repo:name').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'name', 'master'], 'user/repo:name'))
  tfunc.parse('user/repo#branch').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'branch'], 'user/repo#branch'))
  tfunc.parse('user/repo#branch:name').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'name', 'branch'], 'user/repo#branch:name'))

  tfunc.parse('https://github.com/user/repo').then((res) => t.deepEqual(res, ['https://github.com/user/repo', 'repo', 'master'], 'https://github.com/user/repo'))
  tfunc.parse('https://github.com/user/repo:name').then((res) => t.deepEqual(res, ['https://github.com/user/repo', 'name', 'master'], 'https://github.com/user/repo:name'))
  tfunc.parse('https://github.com/user/repo#branch').then((res) => t.deepEqual(res, ['https://github.com/user/repo', 'repo', 'branch'], 'https://github.com/user/repo#branch'))
  tfunc.parse('https://github.com/user/repo#branch:name').then((res) => t.deepEqual(res, ['https://github.com/user/repo', 'name', 'branch'], 'https://github.com/user/repo#branch:name'))

  tfunc.parse('git://github.com/user/repo').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'master'], 'git://github.com/user/repo'))
  tfunc.parse('git://github.com/user/repo:name').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'name', 'master'], 'git://github.com/user/repo:name'))
  tfunc.parse('git://github.com/user/repo#branch').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'branch'], 'git://github.com/user/repo#branch'))
  tfunc.parse('git://github.com/user/repo#branch:name').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'name', 'branch'], 'git://github.com/user/repo#branch:name'))

  tfunc.parse('user/repo#tags/tagName').then((res) => t.deepEqual(res, ['https://github.com/user/repo/archive/tagName.' + ((process.platform === 'win32') ? 'zip' : 'tar.gz'), 'repo', 'tagName'], 'user/repo#tags/tagName'))
  tfunc.parse('user/repo#tags/tagName:name').then((res) => t.deepEqual(res, ['https://github.com/user/repo/archive/tagName.' + ((process.platform === 'win32') ? 'zip' : 'tar.gz'), 'name', 'tagName'], 'user/repo#tags/tagName:name'))

  tfunc.parse('https://github.com/user/repo/archive/tagName.zip').then((res) => t.deepEqual(res, ['https://github.com/user/repo/archive/tagName.zip', 'repo', 'tagName'], 'https://github.com/angular/angular.js/archive/tagName.zip'))
  tfunc.parse('https://github.com/user/repo/archive/tagName.tar.gz').then((res) => t.deepEqual(res, ['https://github.com/user/repo/archive/tagName.tar.gz', 'repo', 'tagName'], 'https://github.com/angular/angular.js/archive/tagName.tar.gz'))
  tfunc.parse('https://github.com/user/repo/archive/tagName.zip:name').then((res) => t.deepEqual(res, ['https://github.com/user/repo/archive/tagName.zip', 'name', 'tagName'], 'https://github.com/angular/angular.js/archive/tagName.zip:name'))
})

test('CLI_install_command_normal', (t) => {
  t.plan(9)

  clean(['./napa_modules', '/tmp/napa_cache'], () => {
    t.ok(!fs.existsSync('napa_modules'), 'Napa_modules deleted')
    t.ok(!fs.existsSync('/tmp/napa_cache'), 'Napa cache deleted')
    cli.cli([], () => {
      t.ok(fs.existsSync('napa_modules/test_napa'), 'Module installed (master)')
      const tn = require('test_napa')
      t.ok(tn.complete, 'Module loaded (master)')

      t.ok(fs.existsSync('napa_modules/test_napa_other'), 'Module installed (other)')
      const tno = require('test_napa_other')
      t.ok(tno.other, 'Module loaded (other)')

      t.ok(fs.existsSync('napa_modules/test_napa_archive'), 'Module installed (archive)')
      const tna = require('test_napa_archive')
      t.ok(tna.complete, 'Module loaded (archive)')

      clean(['/tmp/napa_cache', 'napa_modules'], () => {
        t.ok((!fs.existsSync('/tmp/napa_cache') && !fs.existsSync('napa_modules')), 'Modules cleaned up')
      })
    })
  })
})
