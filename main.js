const bot = require("./botbrain");
const auth = require('./auth.json');            //This file stores our credentials

bot.runbot({
    HOST: auth.host,
    USER: auth.username,
    PASS: auth.password,
    SSL: 'false',
    ROOMS: ['bots'],
    MUSTBEMENTIONED: true,

    onMessage: () => processMessage(messageObj)
});

function processMessage(messageObj) {
    console.log(messageObj);
}