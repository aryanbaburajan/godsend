const WebSocket = require("ws");
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

let server = app.listen(PORT, (error) => {
  if (!error) console.log("http://localhost:" + PORT);
  else console.log("Error occurred, server can't start", error);
});

const wss = new WebSocket.Server({ server });

let rooms = {};

function log(x) {
  console.log(x);
}

wss.on("connection", function (ws, req) {
  const searchParams = new URL(req.url, `http://${req.headers.host}`)
    .searchParams;
  const id = searchParams.get("id");
  const username = searchParams.get("username");

  if (!(id in rooms)) rooms[id] = [];
  if (!(username in rooms[id])) {
    console.log(`new client ${username} at ${id}`);
    rooms[id][username] = ws;
  }

  ws.on("message", function (data) {
    log(`on message from ${username}`);
    const message = data.toString();

    Object.keys(rooms[id]).forEach((member) => {
      if (member != username) {
        rooms[id][member].send(message);
        log(`forwarded to ${member}`);
      }
    });
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile("./index.html", { root: path.join(__dirname, "public") });
});

app.get("/app", function (req, res) {
  res.sendFile("./app.html", { root: path.join(__dirname, "public") });
});
