'use strict'

const ora = require('ora')

exports.create = ({ addonName, addonURL }) => {
  const spinner = ora(`Creating ${addonName}`).start()

  setTimeout(() => {
    spinner.succeed()
  }, 1000)
}
