let {PythonShell} = require('python-shell');
const food = require('./food.js');
const parking = require('./parking.js');
const courses = require('./courses.js');
const rooms = require('./buildings.js');

const api = {"food": food, "parking": parking, "rooms": rooms, "courses": courses};
const buildingCodes = ["AB", "AH", "AP", "BA", "BC", "BF", "BI", "BL", "BR", "BT", "BW", "CB", "CR", "EM", "ES", "EX", "FE", "GB", "GI", "HA", "HI", "HS", "IN", "KP", "LA", "LM", "MB", "MC", "MP", "MS", "MU", "MY", "NF", "NL", "OI", "RL", "RS", "RT", "RU", "RW", "SF", "SK", "SS", "TC", "TF", "UC", "VC", "WB", "WE", "WI", "WO", "WW"];

module.exports = (req, res) => {
    let body = req.body;
    const message = body.message;
    console.log(message);
    let intent;
    PythonShell.run("/Users/tonynguyen/Desktop/ML/chatbot-nlp/intention_parser.py", 
        {args: message.toString()}, (error, data) => {
            console.log("Executing python script.")
            if (error) {
                console.log(error);
                res.send(["There was an error! Please try again later!"]);
                res.status(403).end();
            } else {
                intent = data;
                const api_usage = api[intent];
                let entity;
                PythonShell.run("/Users/tonynguyen/Desktop/ML/chatbot-nlp/entity_extraction.py", 
                    {args: message.toString()}, (error, data) => {
                    if (error) {
                        console.log(error);
                        res.send([`I recognize that you are asking me about ${intent}, however, something went wrong while I was searching for results. Please check back later! I apologize for the inconvenience.`]);
                        res.status(403).end();
                    } else {
                        entity = data.toString().toUpperCase();
                    }
                })
                if (intent === "rooms" && !buildingCodes.includes(entity)) {
                    res.send([`I couldn't look for any rooms with the keyword ${entity}. I probably did not understand. If you gave me a full building name, please re-ask me with simply the building code. Further, I also only have access to information of some buildings. You can use http://uoftstudyspot.com/lookup-tool to search!`]);
                } else {
                    let apiResponse = api_usage([entity]);
                    let initialReply = `Sounds like you are asking me about ${intent}.`
                    let info = initialReply;
                    if (intent === "food") {
                        info.push("Here are some food places that might be relevant to what you are looking for!");
                        for (let i = 0; i < apiResponse.length; i++) {
                            const item = apiResponse[i];
                            info.push(`${item.name}: ${item.description} at ${item.description}`);
                        }
                    } else if (intent === "courses") {
                        info.push("Here are some courses that might be relevant to what you are looking for!");
                        for (let i = 0; i < apiResponse.length; i++) {
                            const item = apiResponse[i];
                            info.push(`${item.code}: ${item.name}.\nDescription: ${item.description}\nPrerequisites: ${item.prerequisites}\nCampus: ${item.campus}\nTerm: ${item.term}`);
                        }
                    } else if (intent === "parking") {
                        info.push(`Here are some parking locations near ${entity}!`);
                        for (let i = 0; i < apiResponse.length; i++) {
                            const item = apiResponse[i];
                            info.push(`Campus: ${item.campus}\nType: ${bicycle}\nDescription: ${item.description}\nLocation: ${item.lat}, ${item.lng}`);
                        }
                    } else {
                        info.push(`Here are rooms in ${entity}!`);
                        for (let i = 0; i< apiResponse.length; i++) {
                            const item = apiResponse[i];
                            info.push(`Room ${item.id} from ${item.freeFrom} to ${item.freeTo}.`)
                        }
                    }
                    res.send(info);
                    res.status(200).end();
                }
            }
        })
    
}