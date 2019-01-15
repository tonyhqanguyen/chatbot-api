'use strict';

// express set up
const express = require('express');
const bodyParser = require('body-parser');
const messageWebhook = require('./controllers/messageWebhook.js');

// controllers

// food controller
const food = require('./controllers/food.js');
const parking = require('./controllers/parking.js');
const courses = require('./controllers/courses.js');
const buildings = require('./controllers/buildings.js');

const app = express();
const router = express.Router();

app.set('port', 3000);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(app.get('port'), () => console.log("Webhook server is listening, port " + app.get('port')));

app.post('/', messageWebhook);
app.post('/food', food);
app.post('/parking', parking);
app.post('/courses', courses);
app.get('/buildings', buildings.getBuildings);
app.get('/buildings/:code/rooms', buildings.getRooms);
app.get('/optimize', buildings.optimize);

app.get('/', (req, res) => {
    let VERIFY_TOKEN = 'nlprules';

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
        
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
  
        // Checks the mode and token sent is correct
        if (mode && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
        
        } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
        }
  }
});