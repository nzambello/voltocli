'use strict'
const ora = require('ora')
const { mkAddonsDir } = require('./utils')

exports.add = ({ addonName, addonURL }) => {
  const spinner = ora(`Installing ${addonName}`).start()

  mkAddonsDir()
  spinner.succeed()
}
