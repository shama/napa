'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _Download = require('Download');

var _Download2 = _interopRequireDefault(_Download);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function install(url, installTo) {
  return new _bluebird2.default(function (resolve, reject) {
    new _Download2.default({ extract: true, strip: 1 }).get(url).dest(installTo).run(function (err) {
      return err ? reject(err) : resolve();
    });
  });
}