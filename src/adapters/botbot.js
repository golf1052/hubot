'use strict'

const Adapter = require('../adapter')

class BotBot extends Adapter {
    run() {
        console.log('botbot');
    }
}

exports.use = robot => new BotBot(robot);
