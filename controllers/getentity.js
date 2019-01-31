const { PythonShell } = require('python-shell');
const Promise = require('promise');

module.exports = async (req, res) => {
    let message = req.body.message;
    console.log("in get entity!");
    await PythonShell.run("/Users/tonynguyen/Desktop/ML/chatbot-nlp/entity_extraction.py", 
        {args: message.toString()}, (error, data) => {
        console.log("data for entity", data);
        if (error) {
            res.send("There was an error!");
        } else {
            console.log("data found!");
            res.send(data[0]);
        }
    })
}