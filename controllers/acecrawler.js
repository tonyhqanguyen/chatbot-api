"use strict"

const Promise = require('promise');
const cheerio = require('cheerio');
const request = require('request-promise');
const buildings = require('../essentials/buildinginfo.js');


module.exports = {
    getBuildingCodes: () => {
        const requestOptions = {
            method: 'GET',
            uri: "http://www.ace.utoronto.ca/ws/f?p=200:3:1742256958421901::::P3_BLDG,P3_ROOM:,",
            json: false,
            jar: true
        };

        let promise = new Promise((resolve, reject) => {
            request(requestOptions).then((response) => {
                let $ = cheerio.load(response);
                let buildingCodes = [];

                $('#P3_BLDG').children().each((i, element) => {
                    let code = element.children[0].data.slice(0, 2);
                    let name = buildings.getBuilding(code);
                    buildingCodes[i] = {id: code, name: buildings.getBuilding(code).name};
                });

                resolve(buildingCodes.slice(1));
            }).catch((error) => {
                reject(error);
            });
        });

        return promise;
    },

    getRooms: (buildingCode) => {
        const requestOptions = {
            method: 'GET',
            uri: "http://www.ace.utoronto.ca/ws/f?p=200:3:1742256958421901::::P3_BLDG,P3_ROOM:" + buildingCode + ",",
            json: false,
            jar: true
        };

        console.log("http://www.ace.utoronto.ca/ws/f?p=200:3:1742256958421901::::P3_BLDG,P3_ROOM:" + buildingCode + ",")

        let promise = new Promise((resolve, reject) => {
            console.log("inside promise")
            request(requestOptions).then((response) => {
                console.log("trying to load response");

                let $ = cheerio.load(response);
                let rooms = [];

                console.log("loaded response");
                $("#P3_ROOM").children().each((i, element) => {
                    console.log("ElEMENT " + i);
                    console.log(element.attribs.value);
                    console.log(element.children[0].data);
                    console.log("==================================");
                    rooms[i] = {id: element.attribs.value, name: element.children[0].data};
                });

                resolve(rooms.slice(1));
            }).catch((error) => {
                console.log(error);
                reject(error);
            }); 
        });
        
        return promise;
    },

    getWeekSchedule: (buildingCode, roomNumber, dayOfWeek) => {
        let startDate = dayOfWeek.clone().startOf('isoWeek');

        const requestOptions = {
            method: 'GET',
            uri: `http://www.ace.utoronto.ca/ws/f?p=200:5:::::P5_BLDG,P5_ROOM,P5_CALENDAR_DATE:${buildingCode},${roomNumber},${startDate.format("YYYYMMDD")},`, 
            json: false,
            jar: true
        };

        let schedule = [];

        let promise = new Promise((resolve, reject) => {
            request(requestOptions).then((response) => {
                let $ = cheerio.load(response);

                let currentDateTime = startDate.hours(7);

                $("table.t3SmallWeekCalendar>tbody>tr").each((i, element) => {
                    if (i > 1) {
                        $("td", this).each((i, element) => {
                            let name = $(this).text().trim();
                            if (name != "") {
                                schedule.push({
                                    buildingCode: buildingCode,
                                    roomNumber: roomNumber,
                                    time: currentDateTime.clone(),
                                    name: name,
                                });
                            }
                            currentDateTime.add(1, "day");
                        });
                        currentDateTime.add(1, "hour");
                        currentDateTime.subtract(7, "days");
                    }
                });

                resolve(schedule);
            }).catch((error) => {
                reject(error);
            });
        });

        return promise;
    }
}