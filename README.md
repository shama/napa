# napa [![Build Status](http://img.shields.io/travis/shama/napa.svg?label=Travis CI build)](https://travis-ci.org/shama/napa) [![AppVeyor](https://img.shields.io/appveyor/ci/shama/napa.svg?label=AppVeyor build)](https://ci.appveyor.com/project/shama/napa/branch/master) [![Code Climate](https://img.shields.io/codeclimate/coverage/github/shama/napa.svg)](https://codeclimate.com/github/shama/napa) [![David](https://img.shields.io/david/shama/napa.svg)](https://david-dm.org/shama/napa) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

A helper for installing repos without a `package.json` with npm.

[![NPM](https://nodei.co/npm/napa.png?downloads=true)](https://nodei.co/npm/napa/)

## usage

Install with `npm install napa --save-dev` then setup your local `package.json` scripts as such:

```json
{
  "scripts": {
    "install": "napa username/repo"
  }
}
```

Now when you run `npm install` it will `git clone git://github.com/username/repo node_modules/repo`.

### Want to name the package something else?

```json
{
  "scripts": {
    "install": "napa username/repo:adifferentname"
  }
}
```

Now it will install to `node_modules/adifferentname`.

### Want to install a package not on github?

```json
{
  "scripts": {
    "install": "napa git://example.com/user/repo:privatepackage"
  }
}
```

### Multiple packages?

```json
{
  "scripts": {
    "install": "napa user/repo1:dude user/repo2:rad user/repo3:cool"
  }
}
```

### Prefer a more structured approach?

```json
{
  "scripts": {
    "install": "napa"
  },
  "napa": {
    "foo": "username/repo",
    "bar": "git@example.com:user/repo"
  }
}
```

### Looking to just download a tagged release/a branch/a specific commit on github or just a zip or tar.gz url?

```json
{
  "scripts": {
    "install": "napa"
  },
  "napa": {
    "foo": "username/repo#v1.2.3",
    "bar": "username/bar#some-branch",
    "baz": "username/baz#347259472813400c7a982690acaa516292a8be40",
    "qoo": "https://example.com/downloads/release.tar.gz",
    "fuz": "git+https://yourcompany.com/repos/project.git",
    "goo": "git+ssh://yourcompany.com/repos/project.git"
  }
}
```

### Additional configuration

The application currently supports the following configuration options under a `napa-config` property in package.json.

* "cache" - Set to *false* to completely disable package caching.
* "cache-path" - Override default path to a specific location(relative to the current working directory)
* "log-level" - Set the log level (default is 'info', may also be 'silent', 'error', 'warn', 'verbose', or 'silly').

```json
{
  "napa-config": {
    "cache": false,
    "cache-path": "../.napa-cache",
    "log-level": "error"
  }
}
```

## Release History
* Please view https://github.com/shama/napa/commits/master for history.
* 2.0.1 - Fix path must be a string error (@caseyWebb).
* 2.0.0 - Better detection for github repos, fixes when creating a package.json, cached git #tag urls now get updated properly (@tomekwi). Add config options for disabling cache or setting cache path (@bbsbb). Fix for npm3 erroring when .git folder present (@caseyWebb). Updating dependencies.
* 1.2.0 - Callback optional with cli and do not ignore .gitignore files when unpacking (@dai-shi).
* 1.1.0 - Upgrade download for better downloads behind proxies (@msieurtoph).
* 1.0.2 - Fix references to git specifiers. Thanks @jsdevel!
* 1.0.1 - Fix path to cli.
* 1.0.0 - Avoids duplicate installs and will install from cache.
* 0.4.1 - Fix git reporting non-errors on stderr by running in quiet mode.
* 0.4.0 - Add strip: 1 when downloading to avoid untarring within a sub-directory. Thanks @seei!
* 0.3.0 - Ability to download packages using any URL
* 0.2.0 - Ability to set packages using napa key in package.json
* 0.1.1 - --depth 1 for faster cloning
* 0.1.0 - initial release

## License
Copyright (c) 2016 Kyle Robinson Young
Licensed under the MIT license.
