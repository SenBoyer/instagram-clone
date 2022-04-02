// Dependancies
const express = require("express");

// Config-Express
const app = express();
const port = 3000;

// end-point-posts
app.get("/posts", (request, response) => {
  let posts = [
    {
      caption: "Golden Gate Bridge",
      location: "San Francisco",
    },
    {
      caption: "London Eye",
      location: "London",
    },
  ];
  response.send(posts);
});

// listen
app.listen(process.env.PORT || 3000);
