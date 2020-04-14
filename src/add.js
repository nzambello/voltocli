'use strict'

const ora = require('ora')

exports.add = ({ addonName, addonURL }) => {
  const spinner = ora(`Installing ${addonName}`).start()

  setTimeout(() => {
    spinner.succeed()
  }, 1000)
}
