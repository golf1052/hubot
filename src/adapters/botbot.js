'use strict'

const Adapter = require('../adapter');
const Message = require('../message');
const { WebClient } = require('@slack/web-api');
let t = null;

class BotBot extends Adapter {
    run() {
        t = this;
        this.robot.router.post('/', function(req, res) {
            let body = req.body;
            if (body.type == 'init') {
                t.robot.slack = new WebClient(body.token);
            } else if (body.type == 'slack') {
                t.receive(body.slack);
            }
            res.status(200).end();
        });
        return this.emit('connected');
    }

    receive(slack) {
        if (slack.type == 'message') {
            const message = new Message.SlackMessage(slack);
            this.robot.receive(message);
        } else {
            this.robot.receive(slack);
        }
    }

    send(envelope, ...message) {
        let botbotMessage = null;
        if (message.length == 1) {
            botbotMessage = this.createMessage(message[0], envelope.message.channel, envelope.message.thread_ts);
        } else if (message.length == 2) {
            botbotMessage = this.createMessage(message[0], message[1]);
        }

        if (botbotMessage) {
            this.robot.http('http://localhost:8892/hubot')
                .header('Content-Type', 'application/json')
                .post(JSON.stringify(botbotMessage))(function(err, response, body) {
                });
        }
    }

    createMessage(text, channel, thread) {
        let message = {
            type: 'message',
            text: text,
            channel: channel
        };
        if (thread) {
            message.thread_ts = thread;
        }
        return message;
    }

    logMessage(message) {
        if (message.thread_ts) {
            console.log(`${message.text} to ${message.channel} in thread ${message.thread_ts}`);
        } else {
            console.log(`${message.text} to ${message.channel}`);
        }
    }
}

exports.use = robot => new BotBot(robot);
