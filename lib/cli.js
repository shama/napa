'use strict'

const cwd = process.cwd()
const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')
const Pkg = require('./pkg')

function cli (args, done) {
  const pkg = readPkg()
  const config = getPackageJSONConfigObject('napa-config')
  let pkgs

  if (args.length === 0) {
    pkgs = pkg
  } else if (pkg) {
    pkgs = args.map(parseArgs)
  } else {
    pkgs = []
  }

  Promise.map(pkgs, (pkg) => {
    const url = pkg[0]
    const name = pkg[1]

    return new Pkg(url, name, config).install()
  })
    .then(done)
}

function parseArgs (str) {
  const split = str.split(':')
  let location, name

  if (split.length === 3) {
    name = split[2]
    location = split.slice(0, 2).join(':')
  } else if (split.length === 2) {
    if (split[1].slice(0, 2) === '//') {
      location = split.join(':')
    } else {
      location = split[0]
      name = split[1]
    }
  } else {
    location = split.join(':')
  }

  if (!name) {
    name = location.slice(location.lastIndexOf('/') + 1)
  }

  return [location, name]
}

function readPkg () {
  const repos = getPackageJSONConfigObject('napa')

  return Object.keys(repos).map((repoName) => {
    const repoLocation = repos[repoName]
    return [repoLocation, repoName]
  })
}

function getPackageJSONConfigObject (property) {
  const pkgPath = path.join(cwd, 'package.json')
  if (!fs.existsSync(pkgPath)) {
    return {}
  }

  const pkg = require(pkgPath)
  if (pkg.hasOwnProperty(property)) {
    return pkg[property]
  }
}

module.exports = cli
