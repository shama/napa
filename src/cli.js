import fs from 'fs'
import log from 'npmlog'
import path from 'path'
import Promise from 'bluebird'
import { Spinner } from 'cli-spinner'
import Pkg from './pkg'

const cwd = process.cwd()
const spinner = new Spinner()

export default function cli (args, done) {
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

  log.pause()
  spinner.start()

  Promise
    .map(pkgs, ([location, name, ref]) => new Pkg(location, name, ref, config).install())
    .then(() => spinner.stop(true))
    .then(() => log.resume())
    .then(done)
}

function parseArgs (str) {
  const split = str.split(':')
  let location, name, ref

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

  if (location.indexOf('#') !== -1) {
    const parts = str.split('#')
    location = parts[0]
    ref = parts[1]
  }

  return [location, name, ref]
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
