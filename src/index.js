'use strict'
const { prompt } = require('prompts')
const validate = require('validate-npm-package-name')
const { add } = require('./add')
const { create } = require('./create')

const adjs = ['magic', 'historical', 'galatic', 'nerd', 'colourful', 'rainbow', 'powerful', 'perfect']
const types = ['addon', 'block', 'widget', 'view', 'config']
const getRandomText = (list) => list[Math.floor(Math.random() * Math.floor(list.length))]
const randomName = `volto-${getRandomText(adjs)}-${getRandomText(types)}`

;(async function () {
  const questions = [
    {
      type: 'select',
      name: 'action',
      message: 'Pick an action',
      choices: [
        { title: 'add', description: 'Add an existing addon to your Volto project', value: 'add' },
        { title: 'create', description: 'Create an addon in your Volto project', value: 'create' }
      ],
      initial: 0
    },
    {
      type: 'text',
      name: 'addonName',
      message: (prev) => `What's ${prev === 'add' ? 'the' : 'your new'} addon name?`,
      initial: randomName,
      validate: (value) => validate(value).validForNewPackages
    },
    {
      type: 'text',
      name: 'addonURL',
      message: 'Insert git repository URL',
      initial: `git@github.com:collective/${randomName}.git`
    }
  ]

  const answers = await prompt(questions)

  switch (answers.action) {
    case 'add':
      add(answers)
      break

    case 'create':
      create(answers)
      break
  }
})()
