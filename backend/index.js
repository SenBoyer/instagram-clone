//========DEPENDENCIES==========
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
const { getStorage } = require("firebase-admin/storage");
const { v4: uuidv4 } = require("uuid");
var cors = require("cors");
let busboy = require("busboy");
let fields = {};
let fileData = {};
let path = require("path");
let os = require("os");
let fs = require("fs");

//========EXPRESS JS CONFIG==========//
const app = express();
const port = 3000;
app.use(cors());

//========FIREBASE CONFIG==========

const serviceAccount = require("./serviceAccountKey.json");
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "finstagram-3585f.appspot.com",
});

const db = getFirestore();

const bucket = getStorage().bucket();

//========ENDPOINTS==========//
app.get("/posts", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  let posts = [];
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

app.post("/createPost", (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  let token_id = uuidv4();

  const bb = busboy({ headers: request.headers });

  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    let filepath = path.join(os.tmpdir(), filename);
    file.pipe(fs.createWriteStream(filepath));
    fileData = { filepath, mimeType };
    console.log(
      `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
      filename,
      encoding,
      mimeType
    );
    file
      .on("data", (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
      })
      .on("close", () => {
        console.log(`File [${name}] done`);
      });
  });

  bb.on("field", (name, val, info) => {
    console.log(`Field [${name}]: value: %j`, val);
    fields[name] = val;
  });

  bb.on("close", () => {
    console.log("Done parsing form!");
    bucket.upload(
      fileData.filepath,
      {
        uploadType: "media",
        metadata: {
          metadata: {
            contentType: fileData.mimeType,
            firebaseStorageDownloadTokens: token_id,
          },
        },
      },
      (err, uploadedFile) => {
        if (!err) {
          createDocument(uploadedFile);
        }
      }
    );
    // response.writeHead(303, { Connection: "close", Location: "/" });
    function createDocument(uploadedFile) {
      db.collection("posts")
        .doc(fields.id)
        .set({
          id: fields.id,
          caption: fields.caption,
          location: fields.location,
          date: parseInt(fields.date),
          imgUrl: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${uploadedFile.name}?alt=media&token=${token_id}`,
          name: fields.name,
        })
        .then((req, response) => {
          console.log(response);
        });
    }
    response.end();
  });
  request.pipe(bb);
});

app.delete("/deletePost/:id", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  db.collection("posts").doc(req.params.id).delete();
  res.send({ result: `Deleted post with id: ${req.params.id}` });
});

//========LOCALHOST LISTEN==========
app.listen(process.env.PORT || 3000);
