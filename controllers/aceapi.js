"use strict"

const Promise = require('promise');
const moment = require('moment');
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

module.exports={
	getBuildingCodes: () => {

		let promise = new Promise(function(resolve, reject){
			let cacheKey = "BUILDINGS";

			let buildings = aceCache.get(cacheKey);

			if (buildings == undefined){
				aceScraper.getBuildingCodes().then(function(scrappedBuildings){
					aceCache.set(cacheKey, scrappedBuildings);
					buildings = scrappedBuildings;
					resolve(buildings);
				});
			}else{
				resolve(buildings);
			}

			
		});

		return promise;
	},

	getRooms: (buildingCode) => {
		buildingCode = buildingCode.toUpperCase();

		let promise = new Promise(function(resolve, reject){
			let cacheKey = buildingCode + "ROOMS";

			let rooms = aceCache.get(cacheKey);

			if (rooms == undefined) {
				aceScraper.getRooms(buildingCode).then(function(scrappedRooms){
					aceCache.set(cacheKey, scrappedRooms);
					rooms=scrappedRooms;
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

		let promise = new Promise(function(resolve, reject){
			//check if entry in cache
			let sched = aceCache.get(cacheKey);
			
			//cache hit
			if (sched != undefined){

				//deserialize the time
				for(let i=0; i<sched.length; i++){
					sched[i].time = moment(sched[i].time);
				}

				resolve(sched.filter(function(elem){
					return elem.time.isSame(day, 'day');
				}));

			//cache miss, use scraper and cache the result
			}else{
				aceScraper.getWeekSchedule(buildingCode, roomNumber, day).then(function(sched){
					
					//serialize the time
					for(let i=0; i<sched.length; i++){
						sched[i].time = sched[i].time.valueOf();
					}

					//update the cache
					aceCache.set(cacheKey, sched);

					//deserialize the time
					for(let i=0; i<sched.length; i++){
						sched[i].time = moment(sched[i].time);
					}

					resolve(sched.filter(function(elem){
						return elem.time.isSame(day, 'day');
					}));

				}).catch(reject);
			}

		});

		return promise;
	},
	orderRooms: (buildingCode, time) => {
	time = time.minutes(0);

	let promise = new Promise(function(resolve, reject){
		module.exports.getRooms(buildingCode).then(function(rooms){
			
			//populate free time length, and wait time length for each room at the current time
			let augmentSchedPromises = [];
			for(let i=0; i<rooms.length; i++){
				augmentSchedPromises.push(
					module.exports.getDaySchedule(buildingCode, rooms[i].id, time).then(function(sched){
						let hoursSched = sched.map(function(elem){
							return elem.time.get('hour');
						});

						let currHour = time.get('hour'); 
						let firstFreeHour = null, firstBusyHour = null;

						//find first free hour
						while(currHour < 24){
							if (!hoursSched.includes(currHour)){
								firstFreeHour = currHour;
								break;
							}
							currHour++;
						}

						currHour++;

						//find the first busy hour after the firstFreeHour
						while(currHour < 24){
							if (hoursSched.includes(currHour)){
								firstBusyHour = currHour;
								break;
							}
							currHour++;
						}

						if(firstFreeHour===null) {
							rooms[i].freeFrom = Number.MAX_SAFE_INTEGER
							rooms[i].freeUntil = Number.MIN_SAFE_INTEGER
							rooms[i].waitTime = Number.MAX_SAFE_INTEGER;
							rooms[i].freeTime = Number.MIN_SAFE_INTEGER;
						}else{
							rooms[i].freeFrom = firstFreeHour;
							rooms[i].freeUntil = firstBusyHour || 0
							rooms[i].waitTime = firstFreeHour - time.get('hour');
							if(firstBusyHour===null){
								rooms[i].freeTime = 24 - firstFreeHour;
							}else{
								rooms[i].freeTime = firstBusyHour - firstFreeHour;
							}
						}
					}).catch(reject)
				);
			}

			Promise.all(augmentSchedPromises).then(function () {
				rooms.sort(function(a, b){
					if(a.waitTime < b.waitTime || a.waitTime == b.waitTime && a.freeTime > b.freeTime){
						return -1;
					}else if(a.waitTime > b.waitTime || a.waitTime == b.waitTime && a.freeTime < b.freeTime){
						return 1;
					}else{
						return 0;
					}
				});
				resolve(rooms);
			});

		}).catch(reject);
	});

	return promise;
}
};

// module.exports = {
//     getBuildingCodes: () => {
//         let promise = new Promise((resolve, reject) => {
//             let cacheKey = "BUILDINGS";
//             let buildings = aceCache.get(cacheKey);

//             if (buildings == undefined) {
//                 aceScraper.getBuildingCodes().then((scrappedBuildings) => {
//                     aceCache.set(cacheKey, scrappedBuildings);
//                     buildings = scrappedBuildings;
//                     resolve(buildings);
//                 });
//             } else {
//                 resolve(buildings);
//             }
//         });

//         return promise;
//     },

//     getRooms: (buildingCode) => {
//         buildingCode = buildingCode.toUpperCase();

//         let promise = new Promise((resolve, reject) => {
//             let cacheKey = buildingCode + "ROOMS";
//             let rooms = aceCache.get(cacheKey);

//             if (rooms == undefined) {
//                 aceScraper.getRooms(buildingCode).then((scrappedRooms) => {
//                     aceCache.set(cacheKey, scrappedRooms);
//                     rooms = scrappedRooms;
//                     resolve(rooms);
//                 });
//             } else {
//                 resolve(rooms);
//             }
//         });
        
//         return promise;
//     },

//     getDaySchedule: (buildingCode, roomNumber, day) => {
//         buildingCode = buildingCode.toUpperCase();
//         roomNumber = roomNumber.toUpperCase();

//         let dayKey = day.clone().startOf('isoWeek').format("YYYYMMDD");
//         let cacheKey = buildingCode + roomNumber + dayKey;

//         let promise = new Promise((resolve, reject) => {
//             let schedule = aceCache.get(cacheKey);

//             if (schedule != undefined) {
//                 console.log(buildingCode, schedule.length);
//                 for (let i = 0; schedule.length; i++) {
//                     if (schedule[i] != undefined) {
//                         schedule[i].time = moment(schedule[i].time);
//                     }
//                 }

//                 resolve(schedule.filter((element) => {
//                     return element.time.isSame(day, "day");
//                 }));
//             } else {
//                 aceScraper.getWeekSchedule(buildingCode, roomNumber, day).then(function(schedule) {
//                     for (let i = 0; i < schedule.length; i++) {
// 						schedule[i].time = schedule[i].time.valueOf();
// 					}

//                     aceCache.set(cacheKey, schedule);

//                     for(let i = 0; i < schedule.length; i++){
// 						schedule[i].time = moment(schedule[i].time);
// 					}
//                     console.log(buildingCode, schedule.length);


//                     resolve(schedule.filter((element) => {
//                         return element.time.isSame(day, "day");
//                     }));
//                 }).catch(reject);
//             }
//         });

//         return promise;
//     },

//     orderRooms: (buildingCode, time) => {
//         time = time.minutes(0);
        
//         let promise = new Promise((resolve, reject) => {
//             module.exports.getRooms(buildingCode).then((rooms) => {
//                 let schedulePromises = [];

//                 for (let i = 0; i < rooms.length; i++) {
//                     schedulePromises.push(
//                         module.exports.getDaySchedule(buildingCode, rooms[i].id, time).then((sched) => {
//                             let hoursSched = sched.map(element => {
//                                 return element.time.get('hour');
//                             });

//                             let currentHour = time.get('hour');
//                             let firstFreeHour = null, firstBusyHour = null;

//                             while (currentHour < 24) {
//                                 if (!hoursSched.includes(currentHour)) {
//                                     firstFreeHour = currentHour;
//                                     break;
//                                 }
//                                 currentHour++;
//                             }

//                             currentHour++;
                            
//                             while (currentHour < 24) {
//                                 if (hoursSched.includes(currentHour)) {
//                                     firstBusyHour = currentHour;
//                                     break;
//                                 }
//                                 currentHour++;
//                             }

//                             if (firstFreeHour === null) {
//                                 rooms[i].freeFrom = Number.MAX_SAFE_INTEGER;
//                                 rooms[i].freeUntil = Number.MIN_SAFE_INTEGER;
//                                 rooms[i].waitTime = Number.MAX_SAFE_INTEGER;
//                                 rooms[i].freeTime = Number.MIN_SAFE_INTEGER;
//                             } else {
//                                 rooms[i].freeFrom = firstFreeHour;
//                                 rooms[i].freeUntil = firstBusyHour || 0;
//                                 rooms[i].waitTime = firstFreeHour - time.get('hour');
//                                 if (firstBusyHour === null) {
//                                     rooms[i].freeTime = 24 - firstFreeHour;
//                                 } else {
//                                     rooms[i].freeTime = firstBusyHour - firstFreeHour;
//                                 }
//                             }
//                         }).catch(reject)
//                     );
//                 }

//                 Promise.all(schedulePromises).then(() => {
//                     rooms.sort((a, b) => {
//                         if (a.waitTime < b.waitTime || a.waitTime === b.waitTime && a.freeTime > b.freeTime) {
//                             return -1;
//                         } else if (a.waitTime > b.waitTime || a.waitTime === b.waitTime && a.freeTime < b.freeTime) {
//                             return 1;
//                         } else {
//                             return 0;
//                         }
//                     });
//                     resolve(rooms);
//                 });
//             }).catch(reject);
//         });
        
//         return promise;
//     }
// }