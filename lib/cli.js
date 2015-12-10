'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cli;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _cliSpinner = require('cli-spinner');

var _pkg = require('./pkg');

var _pkg2 = _interopRequireDefault(_pkg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cwd = process.cwd();
var spinner = new _cliSpinner.Spinner();

function cli(args, done) {
  var pkg = readPkg();
  var config = getPackageJSONConfigObject('napa-config');
  var pkgs = undefined;

  if (args.length === 0) {
    pkgs = pkg;
  } else if (pkg) {
    pkgs = args.map(parseArgs);
  } else {
    pkgs = [];
  }

  _npmlog2.default.pause();
  spinner.start();

  _bluebird2.default.map(pkgs, function (_ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var location = _ref2[0];
    var name = _ref2[1];
    var ref = _ref2[2];
    return new _pkg2.default(location, name, ref, config).install();
  }).then(function () {
    return spinner.stop(true);
  }).then(function () {
    return _npmlog2.default.resume();
  }).then(done);
}

function parseArgs(str) {
  var split = str.split(':');
  var location = undefined,
      name = undefined,
      ref = undefined;

  if (split.length === 3) {
    name = split[2];
    location = split.slice(0, 2).join(':');
  } else if (split.length === 2) {
    if (split[1].slice(0, 2) === '//') {
      location = split.join(':');
    } else {
      location = split[0];
      name = split[1];
    }
  } else {
    location = split.join(':');
  }

  if (!name) {
    name = location.slice(location.lastIndexOf('/') + 1);
  }

  if (location.indexOf('#') !== -1) {
    var parts = str.split('#');
    location = parts[0];
    ref = parts[1];
  }

  return [location, name, ref];
}

function readPkg() {
  var repos = getPackageJSONConfigObject('napa');

  return Object.keys(repos).map(function (repoName) {
    var repoLocation = repos[repoName];
    return [repoLocation, repoName];
  });
}

function getPackageJSONConfigObject(property) {
  var pkgPath = _path2.default.join(cwd, 'package.json');
  if (!_fs2.default.existsSync(pkgPath)) {
    return {};
  }

  var pkg = require(pkgPath);
  if (pkg.hasOwnProperty(property)) {
    return pkg[property];
  }
}