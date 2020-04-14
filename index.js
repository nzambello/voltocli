'use strict';

const { prompt } = require('prompts');

(async function(){
    const questions = [];

    const answers = await prompt(questions);
    console.dir(answers);
})();

