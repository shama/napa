# napa [![Build Status](http://img.shields.io/travis/shama/napa.svg)](https://travis-ci.org/shama/napa) [![Build status](https://ci.appveyor.com/api/projects/status/db3kl6mxis97r7ay/branch/master)](https://ci.appveyor.com/project/shama/napa/branch/master) [![gittip.com/shama](http://img.shields.io/gittip/shama.svg)](https://www.gittip.com/shama)

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

### Deactivate internal cache? Force re-installation ?

- `--cache` (or `--no-cache`) : _Default : true_. Activate or deactivate internal cache and force napa to download from external source. Downloaded packages will neither be saved after install.

- `--force` (or `--no-force`) : _Default : false_. If package is already installed, force napa to delete and reinstall.

Usage :

```json
{
  "scripts": {
    "install": "napa --no-cache --force username/repo"
  }
}
```
or

```json
{
  "scripts": {
    "install": "napa --no-cache --force"
  },
  "napa": {
    "foo": "username/repo#v1.2.3",
    "bar": "username/bar#some-branch"
  }
}
```

## Release History
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
Copyright (c) 2014 Kyle Robinson Young
Licensed under the MIT license.
