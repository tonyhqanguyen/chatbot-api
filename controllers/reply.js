let {PythonShell} = require('python-shell');
const food = require('./food.js');
const parking = require('./parking.js');
const courses = require('./courses.js');
const rooms = require('./buildings.js');

const api = {"food": food, "parking": parking, "rooms": rooms, "courses": courses};
const buildingCodes = ["AB", "AH", "AP", "BA", "BC", "BF", "BI", "BL", "BR", "BT", "BW", "CB", "CR", "EM", "ES", "EX", "FE", "GB", "GI", "HA", "HI", "HS", "IN", "KP", "LA", "LM", "MB", "MC", "MP", "MS", "MU", "MY", "NF", "NL", "OI", "RL", "RS", "RT", "RU", "RW", "SF", "SK", "SS", "TC", "TF", "UC", "VC", "WB", "WE", "WI", "WO", "WW"];

module.exports = (req, res) => {
    req.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // let body = req.body;
    // console.log(req.body)
    const message = req.params.msg;
    let intent;
    PythonShell.run("/Users/tonynguyen/Desktop/ML/chatbot-nlp/intention_parser.py", 
        {args: message.toString()}, (error, data) => {
            console.log("Executing python script.")
            if (error) {
                console.log(error);
                res.send(["There was an error! Please try again later!"]);
                res.status(403).end();
            } else {
                intent = data[0];
                let entity;
                PythonShell.run("/Users/tonynguyen/Desktop/ML/chatbot-nlp/entity_extraction.py", 
                    {args: message.toString()}, (error, data2) => {
                    if (error) {
                        console.log(error);
                        res.send([`I recognize that you are asking me about ${intent}, however, something went wrong while I was searching for results. Please check back later! I apologize for the inconvenience.`]);
                        res.status(403).end();
                    } else {
                        entity = data2;
                        console.log(data2);
                        let found = false;
                        for (let t = 0; t < entity.length; t++) {
                            console.log(entity[t]);
                            if (buildingCodes.includes(entity[t])) {
                                found = true;
                                break;
                            }
                        }
                        if (intent === "rooms" && !found) {
                            res.send([`I couldn't look for any rooms with the keyword ${entity}. I probably did not understand. If you gave me a full building name, please re-ask me with simply the building code. Further, I also only have access to information of some buildings. You can use http://uoftstudyspot.com/lookup-tool to search!`]);
                        } else if (entity === null) {
                            res.send([`I didn't really understand what you were looking for. I think that you were asking me about ${intent}, but I couldn't understand what specifically. You can try again later or try asking something more specific.`])
                        } else {
                            console.log("entity", entity);
                            let initialReply = `Sounds like you are asking me about ${intent}.`
                            let info = [initialReply];
                            if (intent === "food") {
                                food(entity, res, info);
                            } else if (intent === "courses") {
                                courses(entity, res, info);                  
                            } else if (intent === "parking") {
                                parking(entity, res, info);
                            } else if (intent === "rooms") {
                                rooms.optimize(entity[0], res, info);
                            }
                            // res.send(info);
                            // res.status(200).end();
                        }
                    }
                })
            }
        })
    
}

// let {PythonShell} = require('python-shell');
// module.exports = (req, res) => {
//     let body = req.body;
//     const message = body.message;
//     let intent;
//     let reply;
//     PythonShell.run("/Users/tonynguyen/Desktop/ML/chatbot-nlp/intention_parser.py", 
//         {args: message.toString()}, function (error, data) {
//             if (error) {
//                 console.log(error);
//                 res.send("There was an error! Please try again later!");
//                 res.status(403).end();
//             } else {
//                 intent = data;
//                 reply = `I think you're asking me about ${intent}. For now, I can only detect this.  Check back later for a more meaningful reply. Sorry :(`;
//                 res.send(reply);
//             }
//         })
//     // res.send(reply + "BLAHBLAH");
//     // res.status(200).end();
// }