'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlIsRepo = urlIsRepo;
exports.clone = clone;
exports.fetch = fetch;
exports.enableShallowCloneBranches = enableShallowCloneBranches;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _cl = require('./cl');

var _cl2 = _interopRequireDefault(_cl);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function urlIsRepo(url) {
  var gitUrlPrefixes = ['git+', 'git://'];
  var githubRepoUrls = /github\.com(?:\/[^\/]+){2}($|#)/;
  var isGitRepo = gitUrlPrefixes.reduce(function (memo, prefix) {
    return memo || url.indexOf(prefix) === 0;
  }, false);
  var isGithubRepo = githubRepoUrls.test(url);

  return isGitRepo || isGithubRepo;
}

function clone(installTo, url, ref) {
  _npmlog2.default.info('napa', 'cloning to ' + installTo);
  return (0, _cl2.default)('git', ['clone', '-b', ref, '--depth', '1', '-q', url.replace('git+', ''), installTo]);
}

function fetch(installTo, ref) {
  if (ref !== 'master') return (0, _cl2.default)('git', ['fetch', 'origin', ref], { cwd: installTo });
  return _bluebird2.default.resolve();
}

/**
 * @see: http://stackoverflow.com/questions/23387057/git-checkout-new-remote-branch-when-cloning-with-depth-1-option
 */
function enableShallowCloneBranches(packageDir) {
  return new _bluebird2.default(function (resolve, reject) {
    var gitConfig = _path2.default.resolve(packageDir, '.git/config');
    _fs2.default.readFile(gitConfig, function (err, config) {
      if (err) {
        return reject(err);
      }

      config = config.toString().replace('fetch = +refs/heads/master:refs/remotes/origin/master', 'fetch = +refs/heads/*:refs/remotes/origin/*');

      _fs2.default.writeFile(gitConfig, config, function (err) {
        return err ? reject(err) : resolve();
      });
    });
  });
}