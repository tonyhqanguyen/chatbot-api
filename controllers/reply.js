const food = require('./food.js');
const parking = require('./parking.js');
const courses = require('./courses.js');
const rooms = require('./buildings.js');
const axios = require('axios');

const api = {"food": food, "parking": parking, "rooms": rooms, "courses": courses};
const buildingCodes = ["AB", "AH", "AP", "BA", "BC", "BF", "BI", "BL", "BR", "BT", "BW", "CB", "CR", "EM", "ES", "EX", "FE", "GB", "GI", "HA", "HI", "HS", "IN", "KP", "LA", "LM", "MB", "MC", "MP", "MS", "MU", "MY", "NF", "NL", "OI", "RL", "RS", "RT", "RU", "RW", "SF", "SK", "SS", "TC", "TF", "UC", "VC", "WB", "WE", "WI", "WO", "WW"];

module.exports = async (req, res) => {
    req.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const message = req.params.msg;
    let intent = await axios({
        url: "https://chatbot-nlp.herokuapp.com/intention",
        method: "post",
        data: {
            "message": message
        }
    }).catch(error => {
        console.log(error);
        res.send(["There was an error! Please try again later!"])
        res.status(403).end();
        return;
    })
    intent = intent.data;

    let entity = await axios({
        url: "https://chatbot-nlp.herokuapp.com/ner",
        method: "post",
        data: {
            "sentence": message
        }
    }).catch(error => {
        console.log(error);
        res.send([`I recognize that you are asking me about ${intent}, however, something went wrong while I was searching for results. Please check back later! I apologize for the inconvenience.`]);
        res.status(403).end();
        return;
    })
    console.log(entity.data);
    entity = entity.data;

    if (intent.intention === rooms) {
        let found = false;
        for (let i = 0; i < entity.entities.length; i++) {
            if (buildingCodes.includes(entity.entities[i])) {
                found = true;
                break;
            }
        }
        if (!found) {
            res.send([`I couldn't look for any rooms with the keyword ${entity}. I probably did not understand. If you gave me a full building name, please re-ask me with simply the building code. Further, I also only have access to information of some buildings. You can use http://uoftstudyspot.com/lookup-tool to search!`]);
            res.status(403).end();
            return;
        }
    }
    const api_to_use = api[intent.intention];
    console.log(intent, api_to_use)
    const initialReply = `Sounds like you are asking me about ${intent.intention}.`
    let info = [initialReply];

    if (intent.intention === "rooms") {
        api_to_use.optimize(entity.entities[0], res, info);
    } else {
        api_to_use(entity, res, info);
    }
}