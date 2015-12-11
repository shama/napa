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
  t.plan(4)

  tfunc('parse user/repo').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'master'], 'user/repo'))
  tfunc('parse user/repo:name').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'name', 'master'], 'user/repo:name'))
  tfunc('parse user/repo#branch').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'repo', 'branch'], 'user/repo#branch'))
  tfunc('parse user/repo#branch:name').then((res) => t.deepEqual(res, ['git://github.com/user/repo', 'name', 'branch'], 'user/repo#branch:name'))
  /*
  tfunc('parse https://github.com/user/repo:testing').then((res) => t.deepEqual(res, ['https://github.com/user/repo', 'testing', ''], 'https://github.com/user/repo:testing'))
  tfunc('parse git://github.com/user/repo2').then((res) => t.deepEqual(res, ['git://github.com/user/repo2', 'repo2', ''], 'git://github.com/user/repo2'))
  // when developing on windows, this returns zip, linux is tar.gz
  tfunc('parse angular/angular.js#v1.2.3:angular').then((res) => t.deepEqual(res, ['https://github.com/angular/angular.js/archive/v1.2.3.' + ((process.platform === 'win32') ? 'zip' : 'tar.gz'), 'angular', 'v1.2.3:angular'], 'angular/angular.js#v1.2.3:angular'))
  tfunc('parse https://github.com/angular/angular.js/archive/master.zip:angular').then((res) => t.deepEqual(res, ['https://github.com/angular/angular.js/archive/master.zip', 'angular', ''], 'https://github.com/angular/angular.js/archive/master.zip:angular'))
  */
})

test('CLI_install_command_normal', (t) => {
  t.plan(6)

  clean(['./napa_modules', '/tmp/napa_cache'], () => {
    t.ok(!fs.existsSync('napa_modules'), 'Napa_modules deleted')
    t.ok(!fs.existsSync('/tmp/napa_cache'), 'Napa cache deleted')
    cli.cli([], true, () => {
      t.ok(fs.existsSync('napa_modules/test_napa'), 'Module installed')
      const tn = require('test_napa')
      const tno = require('test_napa_other')
      t.ok(tn.complete, 'Module loaded (master)')
      t.ok(tno.other, 'Module loaded (other)')
      clean(['./napa_modules', '/tmp/napa_cache'], () => {
        t.ok(!fs.existsSync('napa_modules') && !fs.existsSync('/tmp/napa_cache'), 'Install Cleaned up')
      })
    })
  })
})
