import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'
import cl from './cl'
import log from 'npmlog'

export function urlIsRepo (url) {
  const gitUrlPrefixes = ['git+', 'git://']
  const githubRepoUrls = /github\.com(?:\/[^\/]+){2}($|#)/
  const isGitRepo = gitUrlPrefixes.reduce((memo, prefix) => memo || url.indexOf(prefix) === 0, false)
  const isGithubRepo = githubRepoUrls.test(url)

  return isGitRepo || isGithubRepo
}

export function clone (installTo, url, ref) {
  log.info('napa', `cloning branch: ${ref} to ${installTo}`)
  return cl('git', ['clone', '-b', ref, '--depth', '1', '-q', url.replace('git+', ''), installTo])
}

export function fetch (installTo, ref) {
  if (ref !== 'master') return cl('git', ['fetch', 'origin', ref], { cwd: installTo })
  return Promise.resolve()
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
