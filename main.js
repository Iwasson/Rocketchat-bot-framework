const { driver } = require('@rocket.chat/sdk');
const respmap  = require('./reply');
const auth = require('./auth.json');

// Environment Setup
const HOST = auth.host;
const USER = auth.username;
const PASS = auth.password;
const BOTNAME = auth.username;
const SSL = 'FALSE';
const ROOMS = [];
var myUserId;

// Bot configuration
const runbot = async () => {
    const conn = await driver.connect({ host: HOST})
    myUserId = await driver.login({ username: USER, password: PASS });
    const roomsJoined = await driver.joinRooms( ROOMS );
    console.log('joined rooms');

    const subscribed = await driver.subscribeToMessages();
    console.log('subscribed');

    const msgloop = await driver.reactToMessages( processMessages );
    console.log('connected and waiting for messages');

    const sent = await driver.sendToRoom( BOTNAME + ' is listening ...', ROOMS[0]);
    console.log('Greeting message sent');
}

// Process messages
const processMessages = async(err, message, messageOptions) => {
if (!err) {
    if (message.u._id === myUserId) return;
    const roomname = await driver.getRoomName(message.rid);

    console.log('got message ' + message.msg)
    var response;
    if (message.msg in respmap) {
        response = respmap[message.msg];
    }
    const sentmsg = await driver.sendToRoomId(response, message.rid)
    }
}

runbot();