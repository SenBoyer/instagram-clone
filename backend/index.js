// Dependencies
const express = require("express");
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");

// Config-Express
const app = express();
const port = 3000;

// config firebase

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// end - point - posts;

async function Firebase() {
  app.get("/posts", (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    let posts = [];
    console.log("posts= ", posts);
    db.collection("posts")
      .orderBy("date", "desc")
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          posts.push(doc.data());
        });
        response.send(posts);
      });
  });
}

Firebase();
// listen
app.listen(process.env.PORT || 3000);
