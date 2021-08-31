'use strict'
const fs = require('fs-extra')
const writeJsonFile = require('write-json-file')
const loadJsonFile = require('load-json-file')
const merge = require('lodash.merge')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const git = require('simple-git/promise')

exports.mkAddonsDir = async () => {
  try {
    await fs.mkdirp(`src/addons`)
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

exports.cloneTemplate = async (name, url) => {
  const templateUrl = `git@github.com:nzambello/volto-addon-template.git`
  try {
    await git('./src/addons').clone(templateUrl, name)
    await fs.remove(`./src/addons/${name}/.git`)
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

const replaceInFile = async (fileName, data) => {
  const replaceData = {
    name: data.name,
    url: data.url.ssh({ noGitPlus: true }),
    httpurl: data.url.https({ noGitPlus: true }),
    path: data.url.path(),
    description: data.description,
    author: data.author,
  }

  try {
    const file = await fs.readFile(fileName)

    if (file) {
      const fileContent = Object.keys(replaceData).reduce((acc, key) => {
        let re = new RegExp(`<volto-addon-${key}>`, 'g')
        return acc.replace(re, replaceData[key])
      }, file.toString())

      await fs.writeFile(fileName, fileContent)
    }
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

exports.configTemplate = async (name, url, description, author) => {
  try {
    const data = { name, url, description, author }
    const files = ['package.json', 'README.md', 'LICENSE']
    await Promise.all(files.map((file) => replaceInFile(`./src/addons/${name}/${file}`, data)))

    const repo = git(`./src/addons/${name}`)
    await repo.init()
    await repo.add('.')
    await repo.commit('created addon with voltocli')
    await repo.addRemote('origin', url.ssh({ noGitPlus: true }))
    await repo.push('origin', git.branch().current)
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

const applyToPackageJson = async (name, url) => {
  try {
    const packageJson = await loadJsonFile('package.json')
    const newJson = {
      private: true,
      scripts: {
        'develop:npx': 'npx -p mrs-developer missdev --config=jsconfig.json --output=addons --fetch-https',
        develop: 'missdev --config=jsconfig.json --output=addons --fetch-https',
        omelette: 'ln -sf node_modules/@plone/volto/ omelette',
        preinstall: 'if [ -f $(pwd)/node_modules/.bin/missdev ]; then yarn develop; else yarn develop:npx; fi',
      },
      jest: {
        moduleNameMapper: {
          [`${name}/(.*)$`]: `<rootDir>/src/addons/${name}/src/$1`,
        },
      },
      dependencies: {
        [name]: url.path(),
      },
      devDependencies: {
        'mrs-developer': '1.5.0',
      },
    }
    const updatedJson = merge(packageJson, newJson)

    if (updatedJson.jest.testMatch && updatedJson.jest.testMatch.indexOf('!**/src/addons/**/*') === -1) {
      updatedJson.jest.testMatch.push('!**/src/addons/**/*')
    }

    if (!updatedJson.workspaces) {
      updatedJson.workspaces = []
    }
    updatedJson.workspaces.push(`src/addons/${name}`)

    if (!updatedJson.addons) {
      updatedJson.addons = []
    }
    updatedJson.addons.push(name)

    await writeJsonFile('package.json', updatedJson)
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

const applyToMrsDev = async (name, url) => {
  let mrsDevJson = {}
  try {
    mrsDevJson = await loadJsonFile('mrs.developer.json')
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('\n' + err)
      process.exit(1)
    }
  }

  const updatedJson = {
    ...mrsDevJson,
    [name]: { url: url.ssh({ noGitPlus: true }) },
  }

  try {
    await writeJsonFile('mrs.developer.json', updatedJson)
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}

const applyToJsconfig = async (name) => {
  let jsconfig = {}
  try {
    jsconfig = await loadJsonFile('jsconfig.json')
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('\n' + err)
      process.exit(1)
    }
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
    console.error('\n' + err)
    process.exit(1)
  }
}

const applyToGitIgnore = async () => {
  let gitignore = ''
  try {
    gitignore = await fs.readFile('.gitignore')
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }

  if (gitignore !== '') gitignore = gitignore.toString()
  if (!gitignore.includes('src/addons')) {
    gitignore += '\nsrc/addons'

    try {
      await fs.writeFile('.gitignore', gitignore)
    } catch (err) {
      console.error('\n' + err)
      process.exit(1)
    }
  }
}

exports.applyConfigs = async (name, url) => {
  await Promise.all([
    applyToPackageJson(name, url),
    applyToMrsDev(name, url),
    applyToJsconfig(name),
    applyToGitIgnore(),
  ])
}

exports.formatJson = async () => {
  try {
    await exec('npx prettier --write .eslintrc* jsconfig.json package.json mrs.developer.json')
  } catch (err) {
    console.error('\n' + err)
  }
}

exports.runYarn = async () => {
  try {
    const { stdout, stderr } = await exec(`yarn install`)
  } catch (err) {
    console.error('\n' + err)
    process.exit(1)
  }
}
