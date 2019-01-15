module.exports = (req, res) => {
    const hubChallenge = req.query['hub.challenge'];

    let VERIFY_TOKEN = 'nlprules';

    const hubMode = req.query['hub.mode'];
    const verifyTokenMatches = (req.query['hub.VERIFY_TOKEN'] === VERIFY_TOKEN);

    if (hubMode && verifyTokenMatches) {
        res.status(200).send(hubChallenge);
    } else {
        res.status(403).end();
    }
};