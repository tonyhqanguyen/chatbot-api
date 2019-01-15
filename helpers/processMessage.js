const token = require("access_token.js");
const FACEBOOK_ACCESS_TOKEN = token;
const request = require('request');
let {PythonShell} = require('python-shell');
const Promise = require('promise');

const sendTextMessage = (senderId, text) => {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: "POST",
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    })
}

const typing = (senderId, option) => {
    console.log("Switching action to " + option);
    let action;
    if (option === "on") {
        action = "typing_on";
    } else {
        action = "typing_off"
    }
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        json: {
            recipient: { id: senderId },
            sender_action: action
        },
    })
}

const markRead = (senderId) => {
    console.log("Marking as seen!");
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        json: {
            recipient: { id: senderId },
            sender_action: "mark_seen"
        },
    })
}

module.exports = (event) => {
    const senderID = event.sender.id;
    console.log(senderID);
    const message = event.message.text;
    typing(senderID, "on");
    markRead(senderID);
    let intent;

    console.log(message);
    const options = {
        args: [message.toString()]
    }

    let promise = new Promise((resolve, reject) => {
        PythonShell.run('/Users/tonynguyen/Desktop/ML/chatbot-nlp/Intentions.py', options, (error, data) => {
            console.log("running");
            if (error) {
                console.log(error);
                sendTextMessage(sendID, "There was an error!");
                typing(senderID, "off");
            }
            intent = data;
            console.log(data);
            const result = `Your intent was ${intent}!`;
            sendTextMessage(senderID, result);
            typing(senderID, "off");
        });
    })
}
