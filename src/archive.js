import Promise from 'bluebird'
import Download from 'Download'

export function install (url, installTo) {
  return new Promise((resolve, reject) => {
    new Download({ extract: true, strip: 1 })
      .get(url)
      .dest(installTo)
      .run((err) => err ? reject(err) : resolve())
  })
}
