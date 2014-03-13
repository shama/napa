var napa = require('./')
var test = require('tape')
var path = require('path')

test('args', function(t) {
  t.plan(5)
  t.deepEqual(napa.args('user/repo'), ['git://github.com/user/repo', 'repo'])
  t.deepEqual(napa.args('https://github.com/user/repo:testing'), ['https://github.com/user/repo', 'testing'])
  t.deepEqual(napa.args('git://github.com/user/repo2'), ['git://github.com/user/repo2', 'repo2'])
  t.deepEqual(napa.args('angular/angular.js#v1.2.3:angular'), ['https://github.com/angular/angular.js/archive/v1.2.3.tar.gz', 'angular'])
  t.deepEqual(napa.args('https://github.com/angular/angular.js/archive/master.zip:angular'), ['https://github.com/angular/angular.js/archive/master.zip', 'angular'])
})

test('cmds', function(t) {
  t.plan(3)
  var cmd = napa.cmd(['git://github.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'git://github.com/user/repo', 'node_modules/test'])

  cmd = napa.cmd(['https://github.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'https://github.com/user/repo', 'node_modules/test'])

  cmd = napa.cmd(['https://github.com/angular/angular.js/archive/master.zip', 'angular'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['download', 'https://github.com/angular/angular.js/archive/master.zip', 'node_modules/angular'])
})

test('readpkg', function(t) {
  t.plan(1)
  var actual = napa.readpkg()
  var expected = [['git://github.com/foo/repo', 'foo'], ['https://github.com/emberjs/ember.js/archive/v1.5.0-beta.1.tar.gz', 'ember']]
  t.deepEqual(actual, expected)
})
