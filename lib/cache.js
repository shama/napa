'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _npmCacheFilename = require('npm-cache-filename');

var _npmCacheFilename2 = _interopRequireDefault(_npmCacheFilename);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _tarPack = require('tar-pack');

var _tarPack2 = _interopRequireDefault(_tarPack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tmp = _path2.default.join(require('os').tmpdir(), 'napa_cache');

var _class = (function () {
  function _class(url, opts) {
    _classCallCheck(this, _class);

    var cwd = opts.cwd || process.cwd();

    this.cacheTo = (0, _npmCacheFilename2.default)(typeof opts['cache-path'] !== 'string' ? tmp : _path2.default.resolve(cwd, opts['cache-path']), url);
  }

  _createClass(_class, [{
    key: 'install',
    value: function install(installTo) {
      var _this = this;

      return new _bluebird2.default(function (resolve, reject) {
        _fs2.default.createReadStream(_this.cacheTo).pipe(_tarPack2.default.unpack(installTo, function (err) {
          return err ? reject(err) : resolve();
        }));
      });
    }
  }, {
    key: 'save',
    value: function save(saveFrom) {
      var _this2 = this;

      return new _bluebird2.default(function (resolve, reject) {
        (0, _mkdirp2.default)(_path2.default.dirname(_this2.cacheTo), function (err) {
          if (err) {
            return reject(err);
          }

          _tarPack2.default.pack(saveFrom, { ignoreFiles: [] }).pipe(_fs2.default.createWriteStream(_this2.cacheTo)).on('close', function (err) {
            return err ? reject(err) : resolve();
          });
        });
      });
    }
  }, {
    key: 'exists',
    get: function get() {
      return _fs2.default.existsSync(this.cacheTo);
    }
  }]);

  return _class;
})();

exports.default = _class;