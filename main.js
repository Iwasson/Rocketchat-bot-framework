const { driver } = require('@rocket.chat/sdk');
const respmap  = require('./reply');
const auth = require('./auth.json');
const axios = require('axios');
const { sendToRoom } = require('@rocket.chat/sdk/dist/lib/driver');
const signAuto = 'https://spot.cat.pdx.edu/api/external/timesheet/sign-auto/';
const signIn = 'https://spot.cat.pdx.edu/api/external/timesheet/sign-in/';
const signOut = 'https://spot.cat.pdx.edu/api/external/timesheet/sign-out/';
const state = 'https://spot.cat.pdx.edu/api/external/timesheet/state/';


// Environment Setup
const HOST = auth.host;
const USER = auth.username;
const PASS = auth.password;
//const BOTNAME = auth.username;
const SSL = 'false';
const ROOMS = ['bots'];
var myUserId;

// Bot configuration
const runbot = async () => {
    const conn = await driver.connect({ host: HOST, useSsl: SSL })
    myUserId = await driver.login({ username: USER, password: PASS });
    const roomsJoined = await driver.joinRooms( ROOMS );
    console.log('joined rooms');

    const subscribed = await driver.subscribeToMessages();
    console.log('subscribed');

    const msgloop = await driver.reactToMessages( processMessages );
    console.log('connected and waiting for messages');
}

// Process messages
const processMessages = async(err, message, messageOptions) => {
    let singleM = message[0];
    let mentioned = false;
    let author = singleM.u.username;
    console.log(singleM);
    
    if(!singleM.unread) { return; }
    if(singleM.mentions[0]) { mentioned = singleM.mentions[0].username; }
    
    if (!err && mentioned) {
        if (singleM.u._id === myUserId) return;
        const roomname = await driver.getRoomName(singleM.rid);

        console.log('got message ' + singleM.msg)
        var response;
        if (singleM.msg in respmap) {
            response = respmap[singleM.msg];
        }
    //const sentmsg = await driver.sendToRoomId("hi", singleM.rid)
    return await reply(singleM.msg, singleM.rid, author);
    }
}

async function reply(message, roomid, author) {
    let command = message.split(" ");
    console.log("processing reply");
    console.log(command[1]);
    console.log("Author: " + author);


    if (command[1] == null) {
        driver.sendToRoomId("Incorrect Input, please try again or use help", roomid);
    }
    else if (command[2] == null && command[1].toLowerCase() == "help") {
        driver.sendToRoomId("This bot is for Signing in and Signing out on your Remote Shifts" +
            "\n\"Sign in\" Signs you in for your shift!" +
            "\n\"Sign out\" Signs you out for your shift!" +
            "\n\"Sign in -force\" Forces a sign in regardless of a sign out (please don't use this unless you know what you are doing)" +
            "\n\"Sign out -force\" Forces a sign out regardless of a sign in (please don't use this unless you know what you are doing)" +
            "\n Note: SPOT manages your timesheet, check it regularly to make sure everything is correct!" +
            "\nEasy as pie! If you have further questions, suggestions or if this bot dies ping Bishop!" , roomid);
    }
    else {
        if(!command[2]) { driver.sendToRoomId("Incorrect Input, please try again or use help" , roomid); }
        switch (command[1].toLowerCase() + " " + command[2].toLowerCase()) {
            case "sign in":
                clock(driver, command, author, roomid);
                break;
            case "sign out":
                clock(driver, command, author, roomid);
                break;
            default:
                driver.sendToRoomId("Incorrect Input, please try again or use help" , roomid);
                break;
        }
    }
}

//gets the last signin/out time and returns an error if the user is trying to do a double punch
async function getLastSign(user) {
    let status = null;
    await axios.get(state + user + auth.key)
        .then(function (response) {
            // handle success
            status = response.data.state;
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            status = null;
        })
    return status;
}

//one clock function since we need to do less work, SPOT api does most of the work for us
async function clock(driver, command, author, roomid) {
    let com = command[1] + " " + command[2];
    if (com != null) { com = com.toLowerCase();}

    console.log(com);

    let user = author;
    let option = "auto";
    let force = false;
    let status = await getLastSign(user);

    let failed = true;

    if (com == "sign in" && command[3] != "-force" && status != "signed-in") { driver.sendToRoomId("Signing you in " + user, roomid); failed = false; }
    else if(com == "sign in" && command[3] != "-force" && status == "signed-in") { driver.sendToRoomId("It looks like you are already signed in. If you forgot to sign out then use \"Sign in -force\" to make a new punch", roomid); return;}

    if (com == "sign out" && command[3] != "-force" && status != "signed-out") { driver.sendToRoomId("Signing you out " + user, roomid); failed = false;}
    else if(com == "sign out" && command[3] != "-force" && status == "signed-out") { driver.sendToRoomId("It looks like you are already signed out. If you forgot to sign in then use \"Sign out -force\" to make a new punch", roomid); return;}

    if (com == "sign in" && command[3] == "-force") { driver.sendToRoomId("Signing you in forcefully " + user, roomid); force = true; option = "in"; failed = false;}
    if (com == "sign out" && command[3] == "-force") { driver.sendToRoomId("Signing you out forcefully " + user, roomid); force = true; option = "out"; failed = false;}
    if(failed == true) { driver.sendToRoomId("I do not understand your request, please try again or use the \"help\" command", roomid); return; }


    //structure is signAuto + user + key 
    if (force == false) {
        axios.get(signAuto + user + auth.key)
            .then(function (response) {
                // handle success
                console.log(response.data.message);
                //event.respond(response.data.message);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                //event.respond(error);
            })
    }
    else if (option == "in") {
        axios.get(signIn + user + auth.key)
            .then(function (response) {
                // handle success
                console.log(response);
                //event.respond(response.data.message);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                //event.respond(error);
            })
    }
    else if (option == "out") {
        axios.get(signOut + user + auth.key)
            .then(function (response) {
                // handle success
                console.log(response);
                //event.respond(response.data.message);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                //event.respond(error);
            })
    }
}






runbot();