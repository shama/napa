'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.urlIsRepo = urlIsRepo;
exports.checkout = checkout;
exports.clone = clone;
exports.fetch = fetch;
exports.enableShallowCloneBranches = enableShallowCloneBranches;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _child_process = require('child_process');

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

function checkout(installTo, ref) {
  var fetch = (0, _child_process.spawn)('git', ['checkout', 'origin/' + ref], { cwd: installTo });
  return new _bluebird2.default(function (resolve, reject) {
    fetch.on('close', function (code) {
      if (code === 0) {
        resolve();
      }
    });
  });
}

function clone(installTo, url) {
  var clone = (0, _child_process.spawn)('git', ['clone', '--depth', '1', '-q', url.replace('git+', ''), installTo]);
  return new _bluebird2.default(function (resolve, reject) {
    clone.stderr.on('data', function (err) {
      return reject(err.toString());
    });
    clone.on('close', function (code) {
      if (code === 0) {
        resolve();
      }
    });
  });
}

function fetch(installTo, ref) {
  var fetch = (0, _child_process.spawn)('git', ['fetch', 'origin', ref], { cwd: installTo });
  return new _bluebird2.default(function (resolve, reject) {
    fetch.stderr.on('data', function (err) {
      var fatal = err.toString().indexOf('fatal') !== -1;
      if (fatal) {
        reject(err.toString());
      }
    });
    fetch.on('close', function (code) {
      if (code === 0) {
        resolve();
      }
    });
  });
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