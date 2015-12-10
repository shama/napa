import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'
import { spawn } from 'child_process'

export function urlIsRepo (url) {
  const gitUrlPrefixes = ['git+', 'git://']
  const githubRepoUrls = /github\.com(?:\/[^\/]+){2}($|#)/
  const isGitRepo = gitUrlPrefixes.reduce((memo, prefix) => memo || url.indexOf(prefix) === 0, false)
  const isGithubRepo = githubRepoUrls.test(url)

  return isGitRepo || isGithubRepo
}

export function checkout (installTo, ref) {
  const fetch = spawn('git', ['checkout', `origin/${ref}`], { cwd: installTo })
  return new Promise((resolve, reject) => {
    fetch.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
    })
  })
}

export function clone (installTo, url) {
  const clone = spawn('git', ['clone', '--depth', '1', '-q', url.replace('git+', ''), installTo])
  return new Promise((resolve, reject) => {
    clone.stderr.on('data', (err) => reject(err.toString()))
    clone.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
    })
  })
}

export function fetch (installTo, ref) {
  const fetch = spawn('git', ['fetch', 'origin', ref], { cwd: installTo })
  return new Promise((resolve, reject) => {
    fetch.stderr.on('data', (err) => {
      const fatal = err.toString().indexOf('fatal') !== -1
      if (fatal) {
        reject(err.toString())
      }
    })
    fetch.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
    })
  })
}

/**
 * @see: http://stackoverflow.com/questions/23387057/git-checkout-new-remote-branch-when-cloning-with-depth-1-option
 */
export function enableShallowCloneBranches (packageDir) {
  return new Promise((resolve, reject) => {
    const gitConfig = path.resolve(packageDir, '.git/config')
    fs.readFile(gitConfig, (err, config) => {
      if (err) {
        return reject(err)
      }

      config = config
        .toString()
        .replace('fetch = +refs/heads/master:refs/remotes/origin/master',
          'fetch = +refs/heads/*:refs/remotes/origin/*')

      fs.writeFile(gitConfig, config, (err) => err ? reject(err) : resolve())
    })
  })
}
