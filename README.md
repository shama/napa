# napa
A helper for installing repos without a `package.json` with npm.

## usage

Install with `npm install napa` then setup your local `package.json` scripts as such:

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

## Release History
* 0.2.0 - Ability to set packages using napa key in package.json
* 0.1.1 - --depth 1 for faster cloning
* 0.1.0 - initial release

## License
Copyright (c) 2013 Kyle Robinson Young  
Licensed under the MIT license.
