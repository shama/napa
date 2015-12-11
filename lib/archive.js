'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _download = require('download');

var _download2 = _interopRequireDefault(_download);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _cl = require('./cl');

var _cl2 = _interopRequireDefault(_cl);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function install(fileName, url, downloadTo, installTo, cache, cacheTo) {
  // DOWNLOAD
  return new _bluebird2.default(function (resolve, reject) {
    _npmlog2.default.info('napa', 'Downloading...');
    new _download2.default().get(url).dest(downloadTo).run(function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  })
  // Create installation directory
  .then(function () {
    _npmlog2.default.info('napa', 'Creating installation directory...');
    return (0, _cl2.default)('mkdir', ['-p', installTo]);
  })
  // Create cache directory
  .then(function (made) {
    _npmlog2.default.info('napa', 'Creating cache diretory...');
    return (0, _cl2.default)('mkdir', ['-p', cacheTo]);
  })
  // UNPACK
  .then(function (made) {
    _npmlog2.default.info('napa', 'Unpacking...');
    return (0, _cl2.default)('tar', ['-xzf', downloadTo + '/' + fileName, '-C', '' + installTo]);
  })
  // Delete defautl .json file
  .then(function () {
    return (0, _cl2.default)('rm', ['--force', installTo + '/package.json']);
  }).then(function () {
    _npmlog2.default.info('napa', 'adjusting package...');
    return (0, _cl2.default)('mv', ['--force', installTo + '/' + _fs2.default.readdirSync('' + installTo)[0] + '/', 'temp']);
  }).then(function () {
    return (0, _cl2.default)('rmdir', ['--ignore-fail-on-non-empty', '' + installTo]);
  }).then(function () {
    return (0, _cl2.default)('mv', ['--force', 'temp', '' + installTo]);
  })
  // MOVE
  .then(function () {
    if (cache) {
      _npmlog2.default.info('napa', 'Moving to cache...');
      return (0, _cl2.default)('mv', [downloadTo + '/' + fileName, cacheTo + '/']);
    } else {
      return _bluebird2.default.resolve();
    }
  })
  // CREATE (If package.json does not exist, create it)
  .then(function () {
    if (!_fs2.default.existsSync(installTo + '/package.json')) {
      _npmlog2.default.info('napa', 'Creating package.json...');
      return new _bluebird2.default(function (resolve, reject) {
        _fs2.default.writeFile(installTo + '/package.json', JSON.stringify({}, null, 2), function (err) {
          return err ? reject(err) : resolve();
        });
      });
    }
  });
}