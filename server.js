var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.get("/" , function(req , res) {
    res.sendFile(__dirname + "/ClubCar.html");
});
app.use(express.static("./"));

var socketList = {};
var playerList = {};
var playerCount = 0;

var createPlayer  = function(id) {
    // object of all the values of a player we want to recieve/send
    var player = {
        playerID: id,
        x: 800,
        y: 400,
        speedX: 0,
        speedY: 0,
        angle: 0,
        angleSpeed: 0,
    }
    return player;
}

io.on("connection" , function(socket) {
    console.log("connected");
    // we create an id that we assign to a player
    socket.id = playerCount;
    playerCount++;

    // we add the new connected player to a list of all other current players
    socketList[socket.id] = socket;
    var player = createPlayer(socket.id);
    playerList[socket.id] = player;

    socket.emit("initialize" , socket.id , playerList);
    socket.broadcast.emit("addPlayer" , playerList[socket.id]);

    socket.on("update" , function(data) {
        playerList[socket.id] = data;
        
        if(playerCount > 1) {
            socket.broadcast.emit("update" , playerList[socket.id]);
        }
    });

    socket.on("disconnect" , function() {
        socket.broadcast.emit("removePlayer" , playerList[socket.id]);
        console.log("disconnected");
        delete socketList[socket.id];
        delete playerList[socket.id];
    });

    socket.on("test" , function() {
        console.log("pass");
    });

    // function update()
});

/*
setInterval(function() {
    // recieve player positions
    // assign new position to servers objects
    // emit the array of players to all users

    // socket.emit("update" , playerList);
} , 25);
*/


server.listen(3000 , function() {
    console.log("listening on localhost:3000");
});