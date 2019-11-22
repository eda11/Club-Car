var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var mysql = require("mysql");

/*
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
})

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
})
*/

app.get("/" , function(req , res) {
    res.sendFile(__dirname + "/ClubCar.html");
});
app.use(express.static("public"));
app.use(express.static(__dirname + "/"));

var socketList = {};
var playerList = {};
var playerCount = 0;
var VroomBuckList = [];
var chatLog = {};

class VroomBuck{
    constructor(id,x,y){
        this.id = id;

        this.x = x;
        this.y = y;
    }
    draw(car,context){
        car.drawOther(vroomBuckImage,0,this.x,this.y,0,0,context)
    }

    checkPickUp(car){
        if(car.checkObjectCollison(this.x-10,this.y-10,  this.x+10,this.y-10,  this.x+10,this.y+10,  this.x-10,this.y+10)){
            console.log("Collide");
            car.score += 5;
            this.move();
        }
    }

    update(x,y){
        this.x = x;
        this.y = y;
    }

    move(){
        this.x = Math.round(Math.random()*3960)+10
        this.y = Math.round(Math.random()*3960)+10
    }
}

for(i = 0; i<100;i++){
    VroomBuckList[i] = new VroomBuck(i,Math.round(Math.random()*3960)+10,Math.round(Math.random()*3960)+10);
}

var createPlayer = function(id) {
    // object of all the values of a player we want to recieve/send
    var player = {
        playerID: id,
        score: 0,
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

    socket.on("login" , function(username , hashPassword) {
        console.log(username);
        console.log(hashPassword);
        socket.emit("start");
    });

    // we add the new connected player to a list of all other current players
    socketList[socket.id] = socket;
    var player = createPlayer(socket.id);
    playerList[socket.id] = player;
    socket.broadcast.emit("getMessage","Car" + socket.id + " Has Connected!");

    socket.emit("initialize" , socket.id , playerList , VroomBuckList);
    socket.broadcast.emit("addPlayer" , playerList[socket.id]);

    socket.on("update" , function(data) {
        playerList[socket.id] = data;
        
        if(playerCount > 1) {
            socket.broadcast.emit("update" , playerList[socket.id]);
        }
    });

    socket.on("updateVroom",function(id,x,y){
        VroomBuckList[id].update(x,y)
        socket.broadcast.emit("updateVroom",id,x,y)
    });

    socket.on("sendMessage",function(message){
        if (message.text.length > 60) {message.text = message.text.substring(0, 60)}
        if(message.text === "!spawn") {
            playerList[socket.id].x = 800;
            playerList[socket.id].y = 400;
            playerList[socket.id].speedX = 0,
            playerList[socket.id].speedY = 0,
            playerList[socket.id].angle = 0,
            playerList[socket.id].angleSpeed = 0,
            socket.emit("move" , playerList[socket.id]);
        }
        else if(message.text === "!speedBoost") {
            playerList[socket.id].score += 1000
            socket.emit("speed" , playerList[socket.id].score);
        }
        else {
            var newMessage = "" + playerList[socket.id].playerID + ":" + message.text;
            socket.broadcast.emit("getMessage",newMessage);
        }

    });

    socket.on("disconnect" , function() {
        socket.broadcast.emit("removePlayer" , playerList[socket.id]);
        console.log("disconnected");
        delete socketList[socket.id];
        delete playerList[socket.id];
        socket.broadcast.emit("getMessage","Car" + socket.id + " has disconnected...");
    });

    socket.on("test" , function() {
        console.log("pass");
    });
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