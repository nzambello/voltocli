'use strict'
const fs = require('fs-extra')

exports.mkAddonsDir = async () => {
  try {
    await fs.mkdirp(`src/addons/fuck`)
  } catch (err) {
    console.error(err)
  }
}
