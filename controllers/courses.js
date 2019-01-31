const request = require('request');
const axios = require('axios');
const key = "gaNSkQ47YVfpvjZaKTwXKnwXZewp5i7k";

module.exports = async (keywords, res, replies) => {
    // let body = req.body;
    let date = new Date();
    // let keywords = body.keywords;
    try {
        let ids = [];
        let descriptCampuses = [];
        let courses = [];
        for (let t = 0; t < keywords.length; t++) {
            let temp  = await axios.get(`https://cobalt.qas.im/api/1.0/courses/search?q=\"${keywords[t]}\"&key=${key}`) 
            temp = temp.data;
            for (let i = 0; i < temp.length; i++) {
                const info = [temp[i].description, temp[i].campus];
                let year = [temp[i].term.slice(0, 4)];
                year = parseInt(year);
                if (!ids.includes(temp[i].id) && 
                    year >= date.getFullYear()) {
                    courses.push(temp[i]);
                    ids.push(temp[i].id);
                }
            }
        }

        newKeywords = [];
        if (courses.length === 0) {
            for (let k = 0; k < keywords.length; k++) {
                let splitWords = keywords[k].split(" ");
                if (splitWords.length > 1) {
                    newKeywords.push(...splitWords);
                }
            }
            keywords = newKeywords;
            for (let t = 0; t < keywords.length; t++) {
                let temp  = await axios.get(`https://cobalt.qas.im/api/1.0/courses/search?q=\"${keywords[t]}\"&key=${key}`) 
                temp = temp.data;
                for (let i = 0; i < temp.length; i++) {
                    const info = [temp[i].description, temp[i].campus];
                    let year = [temp[i].term.slice(0, 4)];
                    year = parseInt(year);
                    if (!ids.includes(temp[i].id) && 
                        year >= date.getFullYear()) {
                        courses.push(temp[i]);
                        ids.push(temp[i].id);
                    }
                }
            }
        }

        if (courses.length === 0) {
            res.status(200).send(["Sorry, I could not find anything from what you told me. I will try to learn and understand more!"])
        } else {
            replies.push("Here are some courses that might be relevant to what you are looking for!");
            for (let i = 0; i < courses.length; i++) {
                const item = courses[i];
                replies.push(`${item.code}: ${item.name}.
                Description: ${item.description}
                Prerequisites: ${item.prerequisites}
                Campus: ${item.campus}
                Term: ${item.term}`);
            }
            res.status(200).send(replies);
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

