const axios = require('axios');
const key = "gaNSkQ47YVfpvjZaKTwXKnwXZewp5i7k";

module.exports = async (keywords, res, replies) => {
    console.log("Searching for food!")
    console.log("keywords", keywords);
    try {
        let ids = [];
        let restaurants = [];
        for (let t = 0; t < keywords.length; t++) {
            let temp = await axios.get(`https://cobalt.qas.im/api/1.0/food/search?q=\"${keywords[t]}\"&key=${key}`);
            temp = temp.data;
            for (let i = 0; i < temp.length; i++) {
                if (!ids.includes(temp[i].id)) {
                    restaurants.push(temp[i]);
                    ids.push(temp[i].id);
                }
            }
        }
        
        newKeywords = [];
        if (restaurants.length === 0) {
            for (let k = 0; k < keywords.length; k++) {
                let splitWords = keywords[k].split(" ");
                if (splitWords.length > 1) {
                    newKeywords.push(...splitWords);
                }
            }
            keywords = newKeywords;
            for (let t = 0; t < keywords.length; t++) {
                let temp = await axios.get(`https://cobalt.qas.im/api/1.0/food/search?q=\"${keywords[t]}\"&key=${key}`);
                temp = temp.data;
                for (let i = 0; i < temp.length; i++) {
                    if (!ids.includes(temp[i].id)) {
                        restaurants.push(temp[i]);
                        ids.push(temp[i].id);
                    }
                }
            }
        }

        if (restaurants.length === 0) {
            res.status(200).send(["Sorry, I could not find anything from what you told me. I will try to learn and understand more!"])
        } else {
            replies.push("Here are some food places that might be relevant to what you are looking for!");
            for (let i = 0; i < restaurants.length; i++) {
                const item = restaurants[i];
                replies.push(`${item.name}: ${item.description}
                Location: ${item.address}`);
            }
            res.status(200).send(replies);
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

