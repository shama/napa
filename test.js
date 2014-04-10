var napa = require('./')
var test = require('tape')
var path = require('path')

test('args', function(t) {
  t.plan(5)
  t.deepEqual(napa.args('user/repo'), ['git://github.com/user/repo', 'repo'])
  t.deepEqual(napa.args('https://github.com/user/repo:testing'), ['https://github.com/user/repo', 'testing'])
  t.deepEqual(napa.args('git://github.com/user/repo2'), ['git://github.com/user/repo2', 'repo2'])
  // when developing on windows, this returns zip, linux is tar.gz
  t.deepEqual(napa.args('angular/angular.js#v1.2.3:angular'), ['https://github.com/angular/angular.js/archive/v1.2.3.'+ ((process.platform == 'win32') ? 'zip' : 'tar.gz'), 'angular'])

  t.deepEqual(napa.args('https://github.com/angular/angular.js/archive/master.zip:angular'), ['https://github.com/angular/angular.js/archive/master.zip', 'angular'])
})

test('cmds', function(t) {
  t.plan(7);
  // makes for friendly testing in windows and linux;
  var testPath = ['node_modules','test'].join(path.sep);


// if github is in the url then its treated like a git+ url
  var cmd = napa.cmd(['git://github.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'git://github.com/user/repo', testPath])

  cmd = napa.cmd(['https://github.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'https://github.com/user/repo', testPath])

// git+ works like npm install see https://www.npmjs.org/doc/cli/npm-install.html

  cmd = napa.cmd(['git+http://test.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'http://test.com/user/repo', testPath])
 
  cmd = napa.cmd(['git+https://test.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'https://test.com/user/repo', testPath])


  cmd = napa.cmd(['git+ssh://test.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['git', 'clone', '--depth', '1', 'ssh://test.com/user/repo', testPath])


// download

  cmd = napa.cmd(['ssh://test.com/user/repo', 'test'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['download', 'ssh://test.com/user/repo', testPath])


  cmd = napa.cmd(['https://github.com/angular/angular.js/archive/master.zip', 'angular'])
  cmd[cmd.length-1] = path.relative(process.cwd(), cmd[cmd.length-1])
  t.deepEqual(cmd, ['download', 'https://github.com/angular/angular.js/archive/master.zip', 'node_modules'+path.sep+'angular'])
})

test('readpkg', function(t) {
  t.plan(1)
  var actual = napa.readpkg()
  var expected = [['git://github.com/foo/repo', 'foo'], ['https://github.com/emberjs/ember.js/archive/v1.5.0-beta.1.tar.gz', 'ember']]
  t.deepEqual(actual, expected)
})
