'use strict'
const ora = require('ora')
const emoji = require('node-emoji')
const chalk = require('chalk')

const { mkAddonsDir, applyConfigs, runYarn } = require('./utils')

exports.add = ({ addonName, addonURL }) => {
  let spinner = ora(`Preparing the environment`).start()
  mkAddonsDir()
  spinner.succeed()

  spinner = ora(`Applying config`).start()
  applyConfigs(addonName, addonURL)
  //   spinner.succeed()

  //   spinner = ora(`Running yarn`).start()
  //   runYarn(addonURL)
  spinner.succeed('Done!')

  console.log(`\n${emoji.emojify(`:white_check_mark: Successfully added ${addonName}`)}\n`)
  console.log(chalk.blueBright('\nNow run:\n\n\tyarn\n\nand start your Volto app:\n\n\tyarn start\n\n'))
  console.log(`${emoji.emojify('Happy hacking! :female-technologist::male-technologist:')}\n\n`)
}
