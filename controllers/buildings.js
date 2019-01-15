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

    optimize: (req, res) => {
        let time = undefined;
        console.log(req.query);
        if (req.query.time != undefined) {
            time = moment(req.query.time, "YYYY-MM-DD::HH");
        } else {
            time = moment();
        }

        ace.orderRooms(req.query.code, time).then((v) => {
            res.json(v);
        }).catch((error) => {
            res.json("error");
            console.log(error);
        });
    }
}
