'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cli = cli;
exports.parseArgs = parseArgs;

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

function cli(args) {
  var testing = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
  var done = arguments[2];

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
  if (!testing) {
    _npmlog2.default.pause();
    spinner.start();
  }
  for (var i = 0; i < pkgs.length; i++) {
    pkgs[i] = parseArgs(pkgs[i][0]);
  }
  _bluebird2.default.map(pkgs, function (_ref) {
    var _ref2 = _slicedToArray(_ref, 3);

    var location = _ref2[0];
    var name = _ref2[1];
    var ref = _ref2[2];
    return new _pkg2.default(location, name, ref, config).install().then(function (res) {
      _bluebird2.default.resolve(res);
    });
  }).then(function () {
    return spinner.stop(true);
  }).then(function () {
    return _npmlog2.default.resume();
  }).then(done);
}

function parseArgs(str) {
  var location = undefined,
      name = undefined,
      ref = undefined;
  var split = str.split(':');
  var nameChanged = false;
  location = str;
  ref = location.replace(/^[^#]*#?/, '');
  if (location.slice(0, 1) === '/') {
    location = location.slice(1);
  }
  if (split.length === 3) {
    name = split[2];
    nameChanged = true;
    location = split.slice(0, 2).join(':');
  } else if (split.length === 2) {
    if (location.indexOf('://') === -1 && location.indexOf('tags/') === -1) {
      name = split[1];
      location = 'git://github.com/' + location;
    } else {
      name = location.slice(location.lastIndexOf('/') + 1);
    }
  } else {
    if (location.indexOf('://') === -1 && location.indexOf('tags/') === -1) {
      location = 'git://github.com/' + location;
    }
    name = location.split('/')[location.split('/').length - 1];
    nameChanged = true;
  }
  if (location.indexOf('#') !== -1) {
    if (location.lastIndexOf(':') < 7 && name.indexOf('#') !== -1) {
      name = name.slice(0, name.lastIndexOf('#'));
      nameChanged = true;
    }
    location = location.slice(0, location.lastIndexOf('#'));
  }
  if (location.lastIndexOf(':') > 6) {
    ref = ref.slice(0, ref.lastIndexOf(':'));
    location = location.slice(0, location.lastIndexOf(':'));
  }
  if (ref.lastIndexOf(':') !== -1) {
    ref = ref.slice(0, ref.lastIndexOf(':'));
  }
  if (location.indexOf('/archive/') !== -1) {
    if (!nameChanged) {
      name = location.slice(0, location.indexOf('/archive/'));
      name = name.slice(name.lastIndexOf('/') + 1);
    }
    var point = location.indexOf('.zip') === -1 ? location.indexOf('.tar.gz') : location.indexOf('.zip');
    ref = location.slice(location.lastIndexOf('/') + 1, point);
  }
  if (ref.indexOf('tags/') !== -1) {
    if (name.indexOf(':') === -1) {
      name = location.slice(location.lastIndexOf('/') + 1);
    } else {
      name = name.slice(name.lastIndexOf(':') + 1);
    }
    ref = ref.slice(ref.indexOf('/') + 1);
    location = 'https://github.com/' + location + '/archive/' + ref + '.' + (process.platform === 'win32' ? 'zip' : 'tar.gz');
  }
  if (ref === '') ref = 'master';
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