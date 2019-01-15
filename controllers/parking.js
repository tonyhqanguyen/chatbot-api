const request = require('request');
const key = "gaNSkQ47YVfpvjZaKTwXKnwXZewp5i7k";

module.exports = (req, res) => {
    let body = req.body;
    console.log("body", body);
    let keywords = body.keywords;
    console.log("keywords: ", keywords);
    try {
        let ids = [];
        let spots = [];
        keywords.forEach(element => {
            request({
                url: `https://cobalt.qas.im/api/1.0/transportation/parking/search?q=\"${element}\"&key=${key}`,
                method: 'GET'
                }, (error, response, body) => {
                    let temp = JSON.parse(body);
                    console.log("body", temp);
                    console.log("body length", temp.length);
                    console.log("first item", temp[0]);
                    if (error === null) {
                        for (let i = 0; i < temp.length; i++) {
                            console.log("id", temp[i].id);
                            if (!ids.includes(temp[i].id)) {
                                console.log("add");
                                spots.push(temp[i]);
                                ids.push(temp[i].id);
                            }
                        }
                    };
                    res.send(spots);
                });
            ;
        });
    } catch (error) {
        res.status(400).end();
    }
}

