const request = require('request');
const key = "gaNSkQ47YVfpvjZaKTwXKnwXZewp5i7k";

module.exports = (req, res) => {
    let body = req.body;
    let date = new Date();
    let keywords = body.keywords;
    try {
        let ids = [];
        let descriptCampuses = [];
        let courses = [];
        keywords.forEach(element => {
            request({
                url: `https://cobalt.qas.im/api/1.0/courses/search?q=\"${element}\"&key=${key}`,
                method: 'GET'
                }, (error, response, body) => {
                    let temp = JSON.parse(body);
                    if (error === null) {
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
                    };
                    console.log("Number of items found: ", courses.length);
                    res.send(courses);
                });
            ;
        });
    } catch (error) {
        res.status(400).end();
    }
}

