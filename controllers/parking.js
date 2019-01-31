const axios = require('axios');
const key = "gaNSkQ47YVfpvjZaKTwXKnwXZewp5i7k";

module.exports = async (keywords, res, replies) => {
    // let body = req.body;
    // console.log("body", body);
    // let keywords = body.keywords;
    // console.log("keywords: ", keywords);
    try {
        let ids = [];
        let spots = [];
        for (let t = 0; t < keywords.length; t++) {
            let temp = await axios.get(`https://cobalt.qas.im/api/1.0/transportation/parking/search?q=\"${keywords[t]}\"&key=${key}`);
            temp = temp.data;
            console.log("temp data", temp);
            for (let i = 0; i < temp.length; i++) {
                console.log("id", temp[i].id);
                if (!ids.includes(temp[i].id)) {
                    console.log("add");
                    spots.push(temp[i]);
                    ids.push(temp[i].id);
                }
            }
        }
        newKeywords = [];
        if (spots.length === 0) {
            for (let k = 0; k < keywords.length; k++) {
                let splitWords = keywords[k].split(" ");
                if (splitWords.length > 1) {
                    newKeywords.push(...splitWords);
                }
            }
            keywords = newKeywords;
            for (let t = 0; t < keywords.length; t++) {
                let temp = await axios.get(`https://cobalt.qas.im/api/1.0/transportation/parking/search?q=\"${keywords[t]}\"&key=${key}`);
                temp = temp.data;
                console.log("temp data", temp);
                for (let i = 0; i < temp.length; i++) {
                    console.log("id", temp[i].id);
                    if (!ids.includes(temp[i].id)) {
                        console.log("add");
                        spots.push(temp[i]);
                        ids.push(temp[i].id);
                    }
                }
            }
        }

        if (spots.length === 0) {
            res.status(200).send(["Sorry, I could not find anything from what you told me. I will try to learn and understand more!"])
        } else {
            replies.push(`Here are some parking locations for ${keywords[0]}!`);
            for (let i = 0; i < spots.length; i++) {
                const item = spots[i];
                replies.push(`Campus: ${item.campus}\n
                Type: ${item.type}\n
                Description: ${item.description}\n
                Location: ${item.lat}, ${item.lng}`);
            }
            res.status(200).send(replies);
        }
    } catch (error) {
        console.log(error);
        return false;
        // res.status(400).end();
    }
}

