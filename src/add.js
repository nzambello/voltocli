'use strict'
const ora = require('ora')
const emoji = require('node-emoji')
const chalk = require('chalk')

const { mkAddonsDir, applyConfigs, runYarn } = require('./utils')

exports.add = ({ name, url }) => {
  let spinner = ora(`Preparing the environment`).start()

  mkAddonsDir().then(() => {
    spinner.succeed()
    spinner = ora(`Applying config`).start()

    applyConfigs(name, url).then(() => {
      spinner.succeed()
      spinner = ora(`Running yarn`).start()

      runYarn().then(() => {
        spinner.succeed('Done!')

        console.log(`\n${emoji.emojify(`:white_check_mark: Successfully added ${name}`)}\n`)
        console.log(chalk.blueBright('\nNow start your Volto app:\n\n\tyarn start\n\n'))
        console.log(`${emoji.emojify('Happy hacking! :female-technologist::male-technologist:')}\n\n`)
      })
    })
  })
}
