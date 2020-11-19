const { driver } = require('@rocket.chat/sdk'); //This is what talks to Rocketchat's API
const auth = require('./auth.json');            //This file stores our credentials

// Environment Setup
const HOST = auth.host;                         //url that rocket is being hosted on
const USER = auth.username;                     //username for the bot
const PASS = auth.password;                     //password for the bot
//const BOTNAME = auth.username;                //alias for the bot name
const SSL = 'false';                            //turns SSL on or off, depends on http or https
const ROOMS = ['bots'];                         //a list of rooms that the bot will attempt to join on startup
var myUserId;                                   //keeps track of the bots id, this is used to prevent the bot from responding to itself
const MUSTBEMENTIONED = true;                   //If this is true then the bot must be @ before it will react to a message
const DELIMITER = " ";                          //Determines what delimiter will be used to break apart incoming messages

// Bot configuration
//This will log the bot on, and start the listening process
const runbot = async () => {
    const conn = await driver.connect({ host: HOST, useSsl: SSL })      //creates the connection to the HOST for the bot
    myUserId = await driver.login({ username: USER, password: PASS });  //attempts to log the bot on
    const roomsJoined = await driver.joinRooms( ROOMS );                //attempts to join the rooms specified in ROOMS
    console.log('joined rooms');                                        //output success

    const subscribed = await driver.subscribeToMessages();              //subscribes the bot to messages, this will let it watch for updates and notifications
    console.log('subscribed');                                          //output success

    const msgloop = await driver.reactToMessages( processMessages );    //start listening to incoming messages, upon received message, call processMessages
    console.log('connected and waiting for messages');                  //notify that the bot is now listening to messages
}

// Process messages
//This will parse the incoming messages
const processMessages = async(err, message, messageOptions) => {
    if(Array.isArray(message)) { message = message[0]; }         //rocketchat 3.8 now sends replies as an array, this will allow for backwards compatability 

    let mentioned = false;                                       //this flag will let us know if the message mentioned the bot
    if(message.mentions.includes(USER)) { mentioned = true; }    //will set the flag to true if the bot was mentioned, leaves it false if not

    let author = message.u.username;                             //gives us the author of the incoming message
    
    if(!message.unread) { return; }                              //checks the unread flag on the message, a message will be reacted to twice, once upon receiving, and once upon reading.
    
    if (!err && (!MUSTBEMENTIONED || mentioned)) {               //there must be no errors, and the bot has to either be mentioned or mentioning must be off
        if (message.u._id === myUserId) return;                  //Ignores any messages sent by the bot
        const roomname = await driver.getRoomName(message.rid);  //gets the name of room the message was sent from
        console.log('got message: ' + message.msg)               //ouput the message contents for debugging 

        return await reply(message.msg, roomname, author);       //this function is called to deal with replies
    }
}


//This will determine how a message is replied to
async function reply(message, roomid, author) {
    let command = message.split(DELIMITER);                     //break the incoming message into parts, using the DELIMITER
    console.log("Author: " + author);                           //output who was the author of the incoming message

    
}


runbot(); //Launches the bot, this line is required and its recommended to put it at the bottom