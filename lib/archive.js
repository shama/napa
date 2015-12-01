'use strict'

const Promise = require('bluebird')
const Download = require('Download')

function install (url, installTo) {
  return new Promise((resolve, reject) => {
    new Download({ extract: true, strip: 1 })
      .get(url)
      .dest(installTo)
      .run((err) => err ? reject(err) : resolve())
  })
}

module.exports = {
  install
}
