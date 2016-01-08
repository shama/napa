'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _npmlog = require('npmlog');

var _npmlog2 = _interopRequireDefault(_npmlog);

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _archive = require('./archive');

var archive = _interopRequireWildcard(_archive);

var _git = require('./git');

var git = _interopRequireWildcard(_git);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _cl = require('./cl');

var _cl2 = _interopRequireDefault(_cl);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = (function () {
  function _class(location, name) {
    var ref = arguments.length <= 2 || arguments[2] === undefined ? 'master' : arguments[2];
    var opts = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, _class);

    this._napaGitRefKey = '_napaGitRef';
    this._napaResolvedKey = '_napaResolved';

    this.cwd = opts.cwd || process.cwd();
    this.log = opts.log || _npmlog2.default;
    this.location = location;
    this.name = name;
    this.ref = ref;
    this.modulesDir = _path2.default.join(this.cwd, 'napa_modules');
    this.installTo = _path2.default.join(this.modulesDir, this.name);

    this.useCache = typeof opts.cache === 'undefined' || opts.cache !== false;
    if (this.useCache) {
      this.cache = new _cache2.default(this.url, opts);
    }
  }

  _createClass(_class, [{
    key: 'install',
    value: function install(done) {
      var _this = this;

      _npmlog2.default.info('napa', 'INSTALLING: ' + this.url);
      if (this.isInstalled) {
        if (this.isCorrectVersion) {
          return _bluebird2.default.resolve();
        } else {
          return this.update();
        }
      } else {
        return (function () {
          switch (_this.installMethod) {
            case 'cache':
              return _this.cache.install(_this.installTo);
            case 'download':
              return archive.install(_this.url.slice(_this.url.lastIndexOf('/') + 1), _this.url, _this.cwd, _this.installTo, _this.useCache, _this.cache.cacheTo.slice(0, _this.cache.cacheTo.lastIndexOf('/')));
            case 'git':
              return git.clone(_this.installTo, _this.url, _this.ref).then(function () {
                return git.enableShallowCloneBranches(_this.installTo);
              }).then(function () {
                return git.fetch(_this.installTo, _this.ref);
              });
          }
        })().then(function () {
          return _this.writePackageJSON();
        }).then(function () {
          return _this.saveToNodeModules();
        }).then(function () {
          return _this.log.info('napa', _this.name + '@' + _this.ref + ' ' + _path2.default.relative(process.cwd(), _this.installTo));
        }).then(function () {
          if (_this.useCache && _this.isInstalled && _this.installMethod !== 'download') {
            return _this.cache.save(_this.installTo).then(function () {
              return _bluebird2.default.resolve(_this);
            });
          } else {
            return _bluebird2.default.resolve(_this);
          }
        }).catch(function (err) {
          _rimraf2.default.sync(_this.installTo);
          _this.log.error('napa', 'Error installing', _this.name, '\n', err.toString());
        });
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var _this2 = this;

      return (function () {
        switch (_this2.installMethod) {
          case 'cache':
            return _this2.cache.install(_this2.installTo);
          case 'download':
            return archive.install(_this2.url, _this2.installTo);
          case 'git':
            return git.fetch(_this2.installTo, _this2.ref).then(function () {
              return git.checkout(_this2.installTo, _this2.ref);
            });
        }
      })().then(function () {
        return _this2.writePackageJSON();
      }).then(function () {
        return _this2.saveToNodeModules();
      }).then(function () {
        _this2.log.info('napa', _this2.name + '@' + _this2.ref + ' ' + _path2.default.relative(process.cwd(), _this2.installTo));
      }).then(function () {
        return _this2.useCache && _this2.isInstalled ? _this2.cache.save(_this2.installTo) : _bluebird2.default.resolve();
      }).catch(function (err) {
        _rimraf2.default.sync(_this2.installTo);
        _this2.log.error('napa', 'Error updating', _this2.name, '\n', err.toString());
      });
    }
  }, {
    key: 'writePackageJSON',
    value: function writePackageJSON() {
      var filepath = _path2.default.join(this.installTo, 'package.json');
      var pkg = {};

      if (_fs2.default.existsSync(filepath)) {
        pkg = require(filepath);
      }

      pkg.name = pkg.name || this.name;
      pkg.version = pkg.version || '0.0.0';
      pkg.description = pkg.description || '-';
      pkg.repository = pkg.repository || { type: 'git', url: '-' };
      pkg.readme = pkg.readme || '-';
      pkg.main = 'index.js';
      pkg.author = '';

      pkg[this._napaResolvedKey] = this.url;
      pkg[this._napaGitRefKey] = this.ref;

      return new _bluebird2.default(function (resolve, reject) {
        _fs2.default.writeFile(filepath, JSON.stringify(pkg, null, 2), function (err) {
          return err ? reject(err) : resolve();
        });
      });
    }
  }, {
    key: 'saveToNodeModules',
    value: function saveToNodeModules() {
      return (0, _cl2.default)('npm', ['install', '--save-optional', 'file:' + this.installTo]);
    }
  }, {
    key: 'isInstalled',
    get: function get() {
      var existing = _path2.default.join(this.installTo, 'package.json');
      return _fs2.default.existsSync(existing);
    }
  }, {
    key: 'isCorrectVersion',
    get: function get() {
      var pkgJSON = require(_path2.default.join(this.installTo, 'package.json'));

      if (this.isGitRepo) {
        return pkgJSON[this._napaGitRefKey] === this.ref;
      } else {
        return pkgJSON[this._napaResolvedKey] === this.url;
      }
    }
  }, {
    key: 'isGitRepo',
    get: function get() {
      return git.urlIsRepo(this.url);
    }
  }, {
    key: 'url',
    get: function get() {
      var url = this.location;

      if (typeof url !== 'string') {
        if (url.url) url = url.url;else return false;
      }

      if (url.indexOf('#') !== -1) {
        if (url.indexOf('://') === -1) {
          var userRepo = url.split('#')[0];
          url = 'https://github.com/' + userRepo;
        } else {
          url = url.split('#')[0];
        }
      }

      if (url.slice(0, 1) === '/') {
        url = url.slice(1);
      }

      if (url.indexOf('git@') !== -1) {
        url = 'https://' + url.split('@')[1].replace(':', '/');
      }

      if (url.indexOf('://') === -1 && url.indexOf('@') === -1) {
        url = 'git://github.com/' + url;
      }

      return url;
    }
  }, {
    key: 'installMethod',
    get: function get() {
      if (this.useCache && this.cache.exists) {
        return 'cache';
      } else if (this.isGitRepo) {
        return 'git';
      } else {
        return 'download';
      }
    }
  }]);

  return _class;
})();

exports.default = _class;