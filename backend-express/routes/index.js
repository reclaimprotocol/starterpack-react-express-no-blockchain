var express = require('express');
var router = express.Router();
var { reclaimprotocol } = require('@reclaimprotocol/reclaim-sdk');
var { uuid } = require("uuidv4");

const Database = require('better-sqlite3');
const db = new Database('sql.db');
const createTable = "CREATE TABLE IF NOT EXISTS users('userId' varchar, 'verified' number(1));"

const reclaim = new reclaimprotocol.Reclaim();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/request-proofs", async(req, res) => {
    const userId = uuid();
    console.log(userId);
    db.exec(createTable);
    const insertStatement = db.prepare("INSERT INTO users VALUES (@uid, false)");
    insertStatement.run({uid: userId});
    const request = reclaim.requestProofs({
        title: "BlindX - colleagues gossip", // Name of your application
        baseCallbackUrl: process.env.NGROK_BASEURL+"/callback", // use ngrok if you're running the server on localhost
        callbackId: userId, // optional
        contextMessage: "BlindX", //optional
        contextAddress: '', //optional
        requestedProofs: [
            new reclaim.CustomProvider({
                provider: 'google-login',
                payload: {}
            }),
        ],
    });

    const { callbackId } = request;
    const reclaimUrl = await request.getReclaimUrl();
    // Store the callback Id and Reclaim URL in your database
    // ...
    res.json({ reclaimUrl, userId });
     // display this reclaimUrl as a QR code on laptop or as a link on mobile devices for users to initiate creating proofs
})

router.get('/status', async(req, res) => {
  const userId = req.query.userId;
  const user = db.prepare("select * from users where userId=@userId").get({userId});
  res.send(user);
});


router.post("/callback", async (req, res) => {
  const body = Object.keys(req.body)[0];
  try {
    const callbackId = req.query.callbackId;
    const proofs = reclaimprotocol.utils.getProofsFromRequestBody(body)
    const isProofsCorrect = await reclaim.verifyCorrectnessOfProofs(callbackId, proofs);
    if (isProofsCorrect) {
      const proof = proofs[0];
      if(proof.provider !== "google-login") return res.status(403).send("Wrong proof");
      const params = JSON.parse(proof.parameters);
      const company = params.emailAddress.split("@")[1];
      db.prepare("update users set verified=1 where userId=@userId").run({userId: callbackId});
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: "Proofs verification failed" });
    }
  } catch (error) {
    console.error("Error processing callback:", error);
    return res.status(500).json({ error: "Failed to process callback" });
  }
});

const port = 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = router;
