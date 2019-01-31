"use strict"

const Promise = require('promise');
const express = require('express');
const moment = require('moment');
require('moment-round');
const ace = require('./aceapi.js');

module.exports = {
    getBuildings: (req, res) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        ace.getBuildingCodes().then((v) => {
            res.json(v);
        }).catch((error) => {
            res.json("error");
            console.log(error);
        });
    },

    getRooms: (req, res) => {
        console.log("get rooms");
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        ace.getRooms(req.params.code).then((v) => {
            res.json(v);
        }).catch((error) => {
            res.json("error");
            console.log(error);
        });
    },

    optimize: (code, res, replies) => {
        // let time = undefined;
        // console.log(req.query);
        // if (req.query.time != undefined) {
        //     time = moment(req.query.time, "YYYY-MM-DD::HH");
        // } else {
        //     time = moment();
        // }

        ace.orderRooms(code, moment()).then((v) => {
            replies.push(`Here are rooms in ${code}!`);
            if (v.length === 0) {
                res.status(200).send(["Sorry, I could not find anything from what you told me. I will try to learn and understand more!"])
            } else {
                for (let i = 0; i < v.length; i++) {
                    const item = v[i];
                    replies.push(`Room ${item.id} from ${item.freeFrom} to ${item.freeUntil}.`);
                }
                res.status(200).send(replies);
            }
        }).catch((error) => {
            res.json("error");
            console.log(error);
        });
    }
}
