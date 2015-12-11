'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cli;

var _child_process = require('child_process');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function cli(cmd, args, opts) {
  return new _bluebird2.default(function (resolve, reject) {
    var line = (0, _child_process.spawn)(cmd, args, opts);
    line.stdout.on('data', function (data) {
      _npmlog2.default.info('napa', data.toString());
    });
    line.stderr.on('data', function (err) {
      _npmlog2.default.error('napa', err.toString());
    });
    line.on('close', function (code) {
      if (code === 0) {
        resolve();
      }
    });
  });
}