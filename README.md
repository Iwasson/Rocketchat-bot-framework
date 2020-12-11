# RocketChat Bot Framework for Node
A Basic NodeJS RocketChat Bot Framework

## About
This library is for constructing basic RocketChat bots using NodeJS. Only bare minimum functionality is included.

## Features
* Recieve messages and parse message objects 
* Send replies to messages
* Send messages to specific rooms
* Send messages to a specific user

## Usage
Install and save with [npm](https://www.npmjs.com/):
```
$ npm i rocketchat-node-framework --save
```

## Example usage
```
const bot = require("rocketchat-node-framework")

bot.runbot({
    HOST: 'rocketchat.server',  //server url for rocket
    USER: 'botUsername',        //login username for bot
    PASS: 'botPassword',        //login password for bot
    SSL: 'false',               //specify if using SSL, true = SSL false = no SSL
    ROOMS: ['testRoom'],        //a list of rooms the bot will join on login
    MUSTBEMENTIONED: true,      //true = bot must be @ to recieve messages

    onMessage: processMessage   //define function to deal with messages
})

function processMessage(messageObj, replyTo) {
    console.log(messageObj)             //output message object to console
    replyTo(messageObj, "Hi", options)  //send a reply
}
```

Expected values for replyTo: 
```
messageObj: {
    message:    contents of message
    messageId:  the id of the message
    time:       what time the message was sent, in milliseconds
    room:       where the message came from
    roomid:     id of where the message came from
    author:     username of who sent the message
}

message: "Some string here"

options: {
    alias:  'username'  Who we are sending the message as, good for bridging
    room:   'testRoom'  Where to send the message to, defaults to where message was recieved from if not set
    dm:     'testUser'  pass in username, overrides Room and sends a message to user
}
```