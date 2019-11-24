var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var mysql = require("mysql");
const util = require('util');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    //Use specified password
    password: "",
    //Comment out if not present
    database: "ClubCar"
})

con.connect(function(err) {
    //if (err) console.log(err);
    console.log("Connected!");
})

app.get("/" , function(req , res) {
    res.sendFile(__dirname + "/ClubCar.html");
});
app.use(express.static("public"));
app.use(express.static(__dirname + "/"));

var socketList = {};
var playerList = {};
var playerCount = 0;
var VroomBuckList = [];
var scrapBuckList = [];
var chatLog = {};
var logged = false;

class VroomBuck{
    constructor(id,x,y){
        this.id = id;

        this.x = x;
        this.y = y;
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

class ScrapBuck{
    constructor(id,x,y){
        this.id = id;

        this.x = x;
        this.y = y;
    }
}

function makeScrap(x,y,amount){
    for(i=0;i<amount;i++){
        scrapBuckList.push(new ScrapBuck(i,x+Math.round(Math.random()*60),y+Math.round(Math.random()*60)))
    }
}

for(i = 0; i<400;i++){
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
        speedMod: 0,
        angleMod: 0,
    }
    return player;
}

function loginChecks(username , hashPassword) {
    if(username === "") {
        return "Username is empty";
    };
    if(hashPassword == 0) {
        return "Password is empty";
    };
    return "";
};

function getFromTable(query) {

}

function checkUserName(username) {
    //con.query("select * from Users where userName  = '" + username + "'", function(err, result) {
        //if (err) throw err;
        //console.log(result);
        //if (result.length > 0) {return "Username is already in use"}
        //return "";
    //})
    try {
        console.log("Tried to check")
        //const result = await con.query("select 1 from Users where userName  = '" + username + "'");
        con.query("select * from Users where userName  = '" + username + "'", function(err, result) {
            if (err) throw err;
            console.log(result);
            if (result.length > 0) {return "Username is already in use"}
            return "";
        })
    } catch (err) {
        console.log("HELPHEKPKSALFHASADFILHSDFHIL");
    }
}

function createAccChecks(username , hashPassword , hashRePassword , reCAPTCHA) {
    if(username === "") {
        return "Username is empty";
    };
    if(hashPassword == 0) {
        return "Password is empty";
    };
    if(hashPassword != hashRePassword) {
        return "Passwords are not equal";
    }
    if(reCAPTCHA.length == 0) {
        return "reCAPTCHA uncomplete"
    }

    var continuationCode = null;

    continuationCode = checkUserName(username);
    /*
    con.query("SELECT * FROM Users WHERE userName  = 'ben'", function(err, result,fields) {
        //con.release();
        if (err) throw err;
        console.log(result);
        if (result.length > 0) {continuationCode = "Username is already in use"}
    })
    */

    return continuationCode;
};

function createAccount(username, hashPassword) {
    var sql = "insert into Users (userName, vroomBuck, hashedPassword, posX, posY, logged) VALUES (?)";
    var values = [username,0,hashPassword,500,500,false];
    console.log(sql);
    console.log(values);
    con.query(sql, [values], function(newErr, newResult) {
        if (newErr) throw newErr;
        console.log(newResult);
    })
}

io.on("connection" , function(socket) {
    console.log("connected");

    socket.on("login" , function(username , hashPassword) {
        console.log(username);
        console.log(hashPassword);
        txt = loginChecks(username , hashPassword);
        if(txt === "") {
            socket.emit("start");
        }
        else {
            socket.emit("errorMsg" , txt , "01");
        }
    });

    socket.on("createAcc" , function(username , hashPassword , hashRePassword , reCAPTCHA) {
        console.log(username);
        console.log(hashPassword);
        console.log(hashRePassword);
        console.log(reCAPTCHA.length);
        txt = createAccChecks(username , hashPassword , hashRePassword , reCAPTCHA);
        if(txt === "") {
            createAccount(username, hashPassword);
            socket.emit("start");
        }
        else {
            socket.emit("errorMsg" , txt , "02");
        }
    });

    socket.on("start" , function() {
        logged = true;
        // we create an id that we assign to a player
        socket.id = playerCount;
        playerCount++;

        // we add the new connected player to a list of all other current players
        socketList[socket.id] = socket;
        var player = createPlayer(socket.id);
        playerList[socket.id] = player;
        socket.broadcast.emit("getMessage","Car" + socket.id + " Has Connected!");

        socket.emit("initialize" , socket.id , playerList , VroomBuckList,scrapBuckList);
        socket.broadcast.emit("addPlayer" , playerList[socket.id]);
    });

    socket.on("update" , function(data) {
        var severScore = playerList[socket.id].score;
        playerList[socket.id] = data;
        playerList[socket.id].score = severScore
        if(playerCount > 1) {
            socket.broadcast.emit("update" , playerList[socket.id]);
        }
    });

    socket.on("updateVroom",function(id,carID){
        VroomBuckList[id].move();
        playerList[carID].score += 1;
        socket.emit("UpdateScore",carID,playerList[carID].score)
        socket.broadcast.emit("updateVroom",id,VroomBuckList[id].x,VroomBuckList[id].y)
    });

    socket.on("removeScrap",function(id,carID){
        scrapBuckList.splice(id,1);
        playerList[carID].score += 3;
        socket.emit("UpdateScore",carID,playerList[carID].score)
        socket.broadcast.emit("removeScrap",id);
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
            var newMessage = "Car" + playerList[socket.id].playerID + ":" + message.text;
            socket.broadcast.emit("getMessage",newMessage);
        }

    });

    socket.on("disconnect" , function() {
        console.log("disconnected");
        if(logged) {
            socket.broadcast.emit("removePlayer" , playerList[socket.id]);
            delete socketList[socket.id];
            delete playerList[socket.id];
            socket.broadcast.emit("getMessage","Car" + socket.id + " has disconnected...");
        }
    });

    socket.on("test" , function() {
        console.log("pass");
    });

    socket.on("newScrap",function(x,y,amount){
        makeScrap(x,y,amount);
        socket.broadcast.emit("updateScrap",scrapBuckList);
    })
});

server.listen(3000 , function() {
    console.log("listening on localhost:3000");
});