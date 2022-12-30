var admin = require("firebase-admin");

var serviceAccount = require("lotto-api-a311c-firebase-adminsdk-6awdi-ad2d87ec59.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { admin, db };