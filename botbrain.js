const { driver } = require('@rocket.chat/sdk'); //This is what talks to Rocketchat's API

// Bot configuration
//This will log the bot on, and start the listening process
const runbot = async ({HOST, USER, PASS, SSL, ROOMS, MUSTBEMENTIONED, onMessage}) => {
    const conn = await driver.connect({ host: HOST, useSsl: SSL })      //creates the connection to the HOST for the bot
    myUserId = await driver.login({ username: USER, password: PASS });  //attempts to log the bot on
    const roomsJoined = await driver.joinRooms( ROOMS );                //attempts to join the rooms specified in ROOMS
    console.log('joined rooms');                                        //output success

    const subscribed = await driver.subscribeToMessages();              //subscribes the bot to messages, this will let it watch for updates and notifications
    console.log('subscribed');                                          //output success

    const processMessages = messageBuilder(onMessage, USER, MUSTBEMENTIONED);
    await driver.reactToMessages(processMessages);                      //start listening to incoming messages, upon received message, call processMessages
    console.log('connected and waiting for messages');                  //notify that the bot is now listening to messages
}

const messageBuilder = (onMessage, USER, MUSTBEMENTIONED) => {
    return async(err, message, messageOptions) => {
        if(Array.isArray(message)) { message = message[0]; }             //rocketchat 3.8 now sends replies as an array, this will allow for backwards compatability 
    
        let mentioned = false;                                          //this flag will let us know if the message mentioned the bot
        message.mentions.forEach(mention => {
            if(mention.username.includes(USER)) { mentioned = true; }   //will set the flag to true if the bot was mentioned, leaves it false if not
        });                                       
    
        let author = message.u.username;                             //gives us the author of the incoming message
        if(!message.unread) { return; }                              //checks the unread flag on the message, a message will be reacted to twice, once upon receiving, and once upon reading.
        
        //console.log(message.mentions);
        if (!err && ((MUSTBEMENTIONED && mentioned) || !MUSTBEMENTIONED)) {                //there must be no errors, and the bot has to either be mentioned or mentioning must be off
            if (message.u._id === myUserId) return;                  //Ignores any messages sent by the bot
            const roomname = await driver.getRoomName(message.rid);  //gets the name of room the message was sent from
            console.log('got message: ' + message.msg)               //ouput the message contents for debugging 
    
            messageObj = {
                'message': message.msg,
                'room' : roomname,
                'roomid' : message.rid,
                'author' : author
            }
            onMessage(messageObj, replyTo);
        }
    }
}


const replyTo = async (messageObj, msg) => {
    let message = await driver.prepareMessage(msg, messageObj.roomid);
    //message.alias = userName;
    const sent = await driver.sendMessage(message);
  }

module.exports.runbot = runbot;
