'use strict'
const ora = require('ora')
const { mkAddonsDir } = require('./utils')

exports.create = ({ addonName, addonURL }) => {
  const spinner = ora(`Creating ${addonName}`).start()

  mkAddonsDir()
  spinner.warn('Missing feature: work in progress')
}
