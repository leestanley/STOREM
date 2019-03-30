var express = require("express");
var parser = require("body-parser");

var {OAuth2Client} = require("google-auth-library");
const CLIENT_ID = "345363640056-4cjm25lr91k730q6vl84rs54ll1huqht.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });

  const userId = ticket.getPayload()['sub'];
  return userId;
}

var app = express();
app.use(express.urlencoded());
app.use(express.json());

app.get("/test", function(req, res) {
  res.send("hello world");  
});

app.post("/verifyToken", function(req, res) {
  var token = req.body.token;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Content-Type", "application/json");
  
  if(token && token.trim().length > 0) {
    verify(token).then(function() {
      res.end(JSON.stringify({
        success: true,
        message: null,
        tokenId: token
      }));
    }).catch(function() {
      res.end(JSON.stringify({
        success: false,
        message: "Invalid id token.",
        tokenId: null
      }));
    });
  } else {
    res.end(JSON.stringify({
      success: false,
      message: "Invalid id token.",
      tokenId: null
    }));
  }
});

app.listen(8080);