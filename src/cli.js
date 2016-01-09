import fs from 'fs'
import log from 'npmlog'
import path from 'path'
import Promise from 'bluebird'
import { Spinner } from 'cli-spinner'
import Pkg from './pkg'

const cwd = process.cwd()
const spinner = new Spinner()

export default function (args, done) {
  const pkg = readPkg()
  const config = getPackageJSONConfigObject('napa-config')
  let pkgs = []
  if (args.length === 0) {
    pkgs = pkg
  } else if (pkg.length === 0) {
    pkgs = pkgs.concat(args)
  } else {
    pkgs = pkgs.concat(args).concat(pkg)
  }
  log.pause()
  spinner.start()

  Promise
    .map(pkgs, ([location, name]) => {
      const arr = parseArgs(location)
      return new Pkg(arr[0], name, arr[2], config).install()
    })
    .then(() => spinner.stop(true))
    .then(() => log.resume())
    .then(done)
}

export function parseArgs (str) {
  let location, name, ref
  const split = str.split(':')
  let nameChanged = false
  location = str
  ref = location.replace(/^[^#]*#?/, '')
  if (split.length === 3) {
    name = split[2]
    nameChanged = true
    location = split.slice(0, 2).join(':')
  } else if (split.length === 2) {
    if (location.indexOf('://') === -1 && location.indexOf('tags/') === -1) {
      name = split[1]
      location = 'git://github.com/' + location
    } else {
      name = location.slice(location.lastIndexOf('/') + 1)
    }
  } else {
    if (location.indexOf('://') === -1 && location.indexOf('tags/') === -1) {
      location = 'git://github.com/' + location
    }
    name = location.split('/')[location.split('/').length - 1]
    nameChanged = true
  }
  if (location.indexOf('#') !== -1) {
    if (location.lastIndexOf(':') < 7 && name.indexOf('#') !== -1) {
      name = name.slice(0, name.lastIndexOf('#'))
      nameChanged = true
    }
    location = location.slice(0, location.lastIndexOf('#'))
  }
  if (location.lastIndexOf(':') > 6) {
    ref = ref.slice(0, ref.lastIndexOf(':'))
    location = location.slice(0, location.lastIndexOf(':'))
  }
  if (ref.lastIndexOf(':') !== -1) {
    ref = ref.slice(0, ref.lastIndexOf(':'))
  }
  if (location.indexOf('/archive/') !== -1) {
    if (!nameChanged) {
      name = location.slice(0, location.indexOf('/archive/'))
      name = name.slice(name.lastIndexOf('/') + 1)
    }
    const point = (location.indexOf('.zip') === -1) ? location.indexOf('.tar.gz') : location.indexOf('.zip')
    ref = location.slice(location.lastIndexOf('/') + 1, point)
  }
  if (ref.indexOf('tags/') !== -1) {
    if (name.indexOf(':') === -1) {
      name = location.slice(location.lastIndexOf('/') + 1)
    } else {
      name = name.slice(name.lastIndexOf(':') + 1)
    }
    ref = ref.slice(ref.indexOf('/') + 1)
    location = `https://github.com/${location}/archive/${ref}.${((process.platform === 'win32') ? 'zip' : 'tar.gz')}`
  }
  if (ref === '') ref = 'master'
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
