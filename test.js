var napa = require('./')
var test = require('tape')
var path = require('path')

test('args', function(t) {
  t.plan(3)
  t.deepEqual(napa.args('user/repo'), ['git://github.com/user/repo', 'repo'])
  t.deepEqual(napa.args('https://github.com/user/repo:testing'), ['https://github.com/user/repo', 'testing'])
  t.deepEqual(napa.args('git://github.com/user/repo2'), ['git://github.com/user/repo2', 'repo2'])
})

test('cmds', function(t) {
  t.plan(1)
  var cmd = napa.cmd(['git://github.com/user/repo', 'test'])
  cmd[3] = path.relative(process.cwd(), cmd[3])
  t.deepEqual(cmd, ['git', 'clone', 'git://github.com/user/repo', 'node_modules/test'])
})
