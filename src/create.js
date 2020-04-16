'use strict'
const ora = require('ora')
const emoji = require('node-emoji')
const chalk = require('chalk')

const { mkAddonsDir, cloneTemplate, configTemplate, applyConfigs, runYarn } = require('./utils')

exports.create = ({ name, url, description, author }) => {
  let spinner = ora(`Preparing the environment`).start()

  mkAddonsDir().then(() => {
    spinner.succeed()
    spinner = ora(`Cloning template`).start()

    cloneTemplate(name, url).then(() => {
      spinner.succeed()
      spinner = ora(`Configuring template for ${name}`)

      configTemplate(name, url, description, author).then(() => {
        spinner.succeed()
        spinner = ora(`Applying config`).start()

        applyConfigs(name, url).then(() => {
          spinner.succeed()
          spinner = ora(`Running yarn`).start()

          runYarn().then(() => {
            spinner.succeed('Done!')

            console.log(`\n${emoji.emojify(`:white_check_mark: Successfully created ${name} in src/addons/`)}\n`)
            console.log(chalk.blueBright('\nNow start your Volto app:\n\n\tyarn start\n\n'))
            console.log(`${emoji.emojify('Happy hacking! :female-technologist::male-technologist:')}\n\n`)
          })
        })
      })
    })
  })
}
