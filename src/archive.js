import Promise from 'bluebird'
import Download from 'download'
import fs from 'fs'
import cl from './cl'
import log from 'npmlog'

export function install (fileName, url, downloadTo, installTo, cache, cacheTo) {
  // DOWNLOAD
  return new Promise((resolve, reject) => {
    log.info('napa', 'Downloading...')
    new Download()
      .get(url)
      .dest(downloadTo)
      .run(() => {
        resolve()
      })
  })
  // Create installation directory
  .then(() => {
    log.info('napa', 'Creating installation directory...')
    return cl('mkdir', ['-p', installTo])
  })
  // Create cache directory
  .then((made) => {
    log.info('napa', 'Creating cache diretory...')
    return cl('mkdir', ['-p', cacheTo])
  })
  // UNPACK
  .then((made) => {
    log.info('napa', 'Unpacking...')
    return cl('tar', ['-xzf', `${downloadTo}/${fileName}`, '-C', `${installTo}`])
  })
  // Delete defautl .json file
  .then(() => {
    return cl('rm', ['--force', `${installTo}/package.json`])
  })
  .then(() => {
    log.info('napa', 'adjusting package...')
    return cl('mv', ['--force', `${installTo}/${fs.readdirSync(`${installTo}`)[0]}/`, 'temp'])
  })
  .then(() => {
    return cl('rmdir', ['--ignore-fail-on-non-empty', `${installTo}`])
  })
  .then(() => {
    return cl('mv', ['--force', 'temp', `${installTo}`])
  })
  // MOVE
  .then(() => {
    if (cache) {
      log.info('napa', 'Moving to cache...')
      return cl('mv', [`${downloadTo}/${fileName}`, `${cacheTo}/`])
    } else {
      return Promise.resolve()
    }
  })
  // CREATE (If package.json does not exist, create it)
  .then(() => {
    if (!fs.existsSync(`${installTo}/package.json`)) {
      log.info('napa', 'Creating package.json...')
      return new Promise((resolve, reject) => {
        fs.writeFile(`${installTo}/package.json`, JSON.stringify({}, null, 2), (err) => err ? reject(err) : resolve())
      })
    }
  })
}
