"use strict"

const Promise = require('promise');
const moment = require('moment');
require('moment-round');
const aceScraper = require('./acecrawler.js');
const NodeCache = require("node-cache");
const aceCache = new NodeCache({ stdTTL: 18000, checkperiod: 3600 });

if (!String.prototype.format) {
    String.prototype.format = () => {
        let args = arguments;
        return this.toString().replace(/{(\d+)}/g, (match, number) => {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

const date = (dateString) => {
    return moment(dateString, "YYYYMMDDHHmmss");
}

const round = (date, duration, method) => {
    return moment(Math[method]((+date) / (+duration)) * (+duration));
}

module.exports = {
    getBuildingCodes: () => {
        let promise = new Promise((resolve, reject) => {
            let cacheKey = "BUILDINGS";
            let buildings = aceCache.get(cacheKey);

            if (buildings == undefined) {
                aceScraper.getBuildingCodes().then((scrappedBuildings) => {
                    aceCache.set(cacheKey, scrappedBuildings);
                    buildings = scrappedBuildings;
                    resolve(buildings);
                });
            } else {
                resolve(buildings);
            }
        });

        return promise;
    },

    getRooms: (buildingCode) => {
        buildingCode = buildingCode.toUpperCase();

        let promise = new Promise((resolve, reject) => {
            let cacheKey = buildingCode + "ROOMS";
            let rooms = aceCache.get(cacheKey);

            console.log("rooms are this is running")
            if (rooms == undefined) {
                console.log("nothing cached")
                aceScraper.getRooms(buildingCode).then((scrappedRooms) => {
                    aceCache.set(cacheKey, scrappedRooms);
                    rooms = scrappedRooms;
                    resolve(rooms);
                });
            } else {
                resolve(rooms);
            }
        });
        
        return promise;
    },

    getDaySchedule: (buildingCode, roomNumber, day) => {
        buildingCode = buildingCode.toUpperCase();
        roomNumber = roomNumber.toUpperCase();

        let dayKey = day.clone().startOf('isoWeek').format("YYYYMMDD");
        let cacheKey = buildingCode + roomNumber + dayKey;

        let promise = new Promise((resolve, reject) => {
            let schedule = aceCache.get(cacheKey);

            if (schedule != undefined) {
                for (let i = 0; schedule.length; i++) {
                    schedule[i].time = moment(schedule[i].time);
                }

                resolve(schedule.filter((element) => {
                    return element.time.isSame(day, "day");
                }));
            } else {
                aceScraper.getWeekSchedule(buildingCode, roomNumber, day).then((schedule) => {
                    schedule.forEach(sched => {
                        sched.time = sched.time.valueOf();
                    });

                    aceCache.set(cacheKey, schedule);

                    schedule.forEach(sched => {
                        sched.time = moment(sched.time);
                    });

                    resolve(schedule.filter((element) => {
                        return element.time.isSame(day, "day");
                    }));
                }).catch(reject);
            }
        });

        return promise;
    },

    orderRooms: (buildingCode, time) => {
        time = time.minutes(0);
        
        let promise = new Promise((resolve, reject) => {
            module.exports.getRooms(buildingCode).then((rooms) => {
                let schedulePromises = [];

                for (let i = 0; i < rooms.length; i++) {
                    schedulePromises.push(
                        module.exports.getDaySchedule(buildingCode, rooms[i].id, time).then((sched) => {
                            let hoursSched = sched.map(element => {
                                return element.time.get('hour');
                            });

                            let currentHour = time.get('hour');
                            let firstFreeHour = null, firstBusyHour = null;

                            while (currentHour < 24) {
                                if (!hoursSched.includes(currentHour)) {
                                    firstFreeHour = currentHour;
                                    break;
                                }
                                currentHour++;
                            }

                            currentHour++;
                            
                            while (currentHour < 24) {
                                if (hoursSched.includes(currentHour)) {
                                    firstBusyHour = currentHour;
                                    break;
                                }
                                currentHour++;
                            }

                            if (firstFreeHour === null) {
                                rooms[i].freeFrom = Number.MAX_SAFE_INTEGER;
                                rooms[i].freeUntil = Number.MIN_SAFE_INTEGER;
                                rooms[i].waitTime = Number.MAX_SAFE_INTEGER;
                                rooms[i].freeTime = Number.MIN_SAFE_INTEGER;
                            } else {
                                rooms[i].freeFrom = firstFreeHour;
                                rooms[i].freeUntil = firstBusyHour || 0;
                                rooms[i].waitTime = firstFreeHour - time.get('hour');
                                if (firstBusyHour === null) {
                                    rooms[i].freeTime = 24 - firstFreeHour;
                                } else {
                                    rooms[i].freeTime = firstBusyHour - firstFreeHour;
                                }
                            }
                        }).catch(reject)
                    );
                }

                Promise.all(schedulePromises).then(() => {
                    rooms.sort((a, b) => {
                        if (a.waitTime < b.waitTime || a.waitTime === b.waitTime && a.freeTime > b.freeTime) {
                            return -1;
                        } else if (a.waitTime > b.waitTime || a.waitTime === b.waitTime && a.freeTime < b.freeTime) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                    resolve(rooms);
                });
            }).catch(reject);
        });
        
        return promise;
    }
}