'use strict'
const fs = require('fs-extra')
const writeJsonFile = require('write-json-file')
const loadJsonFile = require('load-json-file')
const merge = require('lodash.merge')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

exports.mkAddonsDir = async () => {
  try {
    await fs.mkdirp(`src/addons`)
  } catch (err) {
    console.error(err)
  }
}

const applyToPackageJson = async (name, url) => {
  try {
    const packageJson = await loadJsonFile('package.json')
    const newJson = {
      scripts: {
        'develop:npx': 'npx -p mrs-developer missdev --config=jsconfig.json --output=addons',
        develop: 'missdev --config=jsconfig.json --output=addons',
        preinstall: 'if [ -f $(pwd)/node_modules/.bin/missdev ]; then yarn develop; else yarn develop:npx; fi',
        postinstall: 'rm -rf ./node_modules/volto-* && yarn omelette',
      },
      jest: {
        moduleNameMapper: {
          [`${name}/(.*)$`]: `<rootDir>/src/addons/${name}/src/$1`,
        },
      },
      dependencies: {
        'mrs-developer': '^1.1.6',
        [name]: url.path(),
      },
    }
    const updatedJson = merge(packageJson, newJson)
    if (updatedJson.jest.testMatch && updatedJson.jest.testMatch.indexOf('!**/src/addons/**/*') === -1) {
      updatedJson.jest.testMatch.push('!**/src/addons/**/*')
    }
    await writeJsonFile('package.json', updatedJson)
  } catch (err) {
    console.error(err)
  }
}

const applyToMrsDev = async (name, url) => {
  let mrsDevJson = {}
  try {
    mrsDevJson = await loadJsonFile('mrs.developer.json')
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(err)
  }

  const updatedJson = {
    ...mrsDevJson,
    [name]: { url: url.ssh({ noGitPlus: true }) },
  }

  try {
    await writeJsonFile('mrs.developer.json', updatedJson)
  } catch (err) {
    console.error(err)
  }
}

const applyToEslintrc = async (name) => {
  let eslintrc = {}
  try {
    eslintrc = await loadJsonFile('.eslintrc')
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(err)
  }

  const newJson = {
    settings: {
      'import/resolver': {
        alias: {},
      },
    },
  }

  const updatedJson = merge(eslintrc, newJson)
  if (!updatedJson.settings['import/resolver'].alias.map) updatedJson.settings['import/resolver'].alias.map = []
  updatedJson.settings['import/resolver'].alias.map.push([name, `./src/addons/${name}/src`])

  try {
    await writeJsonFile('.eslintrc', updatedJson)
  } catch (err) {
    console.error(err)
  }
}

const applyToJsconfig = async (name) => {
  let jsconfig = {}
  try {
    jsconfig = await loadJsonFile('jsconfig.json')
  } catch (err) {
    if (err.code !== 'ENOENT') console.error(err)
  }

  const newJson = {
    compilerOptions: {
      paths: {
        [name]: [`addons/${name}`],
      },
      baseUrl: 'src',
    },
  }

  const updatedJson = merge(jsconfig, newJson)

  try {
    await writeJsonFile('jsconfig.json', updatedJson)
  } catch (err) {
    console.error(err)
  }
}

const applyToGitIgnore = () => {
  let gitignore = ''
  try {
    gitignore = fs.readFileSync('.gitignore')
  } catch (err) {
    console.error(err)
  }

  if (gitignore !== '') gitignore = gitignore.toString()
  if (!gitignore.includes('src/addons')) {
    gitignore += '\nsrc/addons'

    try {
      fs.writeFileSync('.gitignore', gitignore)
    } catch (err) {
      console.error(err)
    }
  }
}

exports.applyConfigs = async (name, url) => {
  await Promise.all([
    applyToPackageJson(name, url),
    applyToMrsDev(name, url),
    applyToJsconfig(name),
    applyToEslintrc(name),
    applyToGitIgnore(),
  ])
}

exports.runYarn = async () => {
  try {
    await exec(`yarn install`)
  } catch (err) {
    console.error(err)
  }
}
