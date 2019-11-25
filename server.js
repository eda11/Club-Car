var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var mysql = require("mysql");
var util = require('util');

//Automatic setup
var startCon = mysql.createConnection({
    //CREDENTIALS
    host: "localhost",
    user: "root",
    password: "SecurityTime6464!",
})

//Creates the database if not present
startCon.connect(function(err){
    //Setup database if not present
    startCon.query("CREATE DATABASE IF NOT EXISTS ClubCar");
    startCon.end();
})

//Create the actual connection
var con = mysql.createConnection({
    //CREDENTIALS
    host: "localhost",
    user: "root",
    password: "SecurityTime6464!",
    database: "ClubCar"
})

con.connect(function(err) {

    //Confirm connection
    console.log("Connected to Database");

    //Create table if not present
    con.query("CREATE TABLE IF NOT EXISTS Users (userName varchar(20),vroomBuck int,hashedPassword varchar(20),posX int,posY int,logged boolean,PRIMARY KEY (userName))");

    //Ensure everyone is logged out
    getInfo("UPDATE Users SET logged = 0", function(result){
        console.log("Setup Users");
    });
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

var createPlayer = function(id, newScore, newX, newY) {
    // object of all the values of a player we want to recieve/send
    var player = {
        playerID: id,
        score: newScore,
        x: newX,
        y: newY,
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

//Callback time
function getInfo(query, callback) {
    con.query(query, function(err, results){
        if (err) {throw err}
        wanted = results;
        return callback(results)
    })
}

function createAccount(username, hashPassword) {
    var sql = "insert into Users (userName, vroomBuck, hashedPassword, posX, posY, logged) VALUES (?)";
    var values = [username,0,hashPassword,500,500,false];
    con.query(sql, [values], function(newErr, newResult) {
        if (newErr) throw newErr;
        console.log(newResult);
        socket.emit("start");
    })
}

io.on("connection" , function(socket) {
    console.log("connected");

    socket.on("login" , function(username , hashPassword) {
        getInfo("SELECT * FROM Users WHERE userName  = '" + username + "' AND hashedPassword = " + hashPassword, function(result){
            var stuffWanted = '';
            stuffWanted = result;
            var txt = '';
            if (stuffWanted.length == 0) {txt = "Username or Password is wrong"}
            else if (stuffWanted[0].logged == true) {txt = "Account is in use"}
            if(username === "") {
                txt = "Username is empty";
            }
            else if(hashPassword == 0) {
                txt = "Password is empty";
            };
            if(txt === "") {
                socket.credentials = [username, hashPassword];
                socket.emit("start");
            }
            else {
                socket.emit("errorMsg" , txt , "01");
            }
        });
    });

    socket.on("createAcc" , function(username , hashPassword , hashRePassword , reCAPTCHA) {
        getInfo("SELECT 1 FROM Users WHERE userName  = '" + username + "'", function(result){
            var txt = "";
            var stuffWanted = '';
            stuffWanted = result;
            if (stuffWanted.length > 0 ){txt = "Username in use"}
            else {
                if(username === "") {
                    txt = "Username is empty";
                }
                else if(hashPassword == 0) {
                    txt = "Password is empty";
                }
                else if(hashPassword != hashRePassword) {
                    txt = "Passwords are not equal";
                }
                else if(reCAPTCHA.length == 0) {
                    txt = "reCAPTCHA uncomplete"
                }
            }
            if(txt === "") {
                var sql = "insert into Users (userName, vroomBuck, hashedPassword, posX, posY, logged) VALUES (?)";
                var values = [username,0,hashPassword,500,500,false];
                con.query(sql, [values], function(newErr, newResult) {
                if (newErr) throw newErr;
                    socket.credentials = [username, hashPassword];
                    socket.emit("start");
                })
            }
            else {
                socket.emit("errorMsg" , txt , "02");
            }
        })
    });

    socket.on("start" , function() {
        // we create an id that we assign to a player
        socket.id = playerCount;
        playerCount++;

        // we add the new connected player to a list of all other current players
        socketList[socket.id] = socket;

        //Get data from the database
        getInfo("SELECT * FROM Users WHERE userName  = '" + socket.credentials[0] + "' AND hashedPassword = " + socket.credentials[1], function(result){
            var stuffWanted = '';
            stuffWanted = result;
            var player = createPlayer(socket.id, stuffWanted[0].vroomBuck, stuffWanted[0].posX, stuffWanted[0].posY);
            getInfo("UPDATE Users SET logged = 1 WHERE userName  = '" + socket.credentials[0] + "' AND hashedPassword = " + socket.credentials[1], function(result2){
                playerList[socket.id] = player;
                socket.broadcast.emit("getMessage",socket.credentials[0] + " Has Connected!");
    
                socket.emit("initialize" , socket.id , playerList , VroomBuckList,scrapBuckList);
                socket.broadcast.emit("addPlayer" , playerList[socket.id]);
                logged = true;
            });
        });
    });

    socket.on("update" , function(data) {
        if(logged) {
            var severScore = playerList[socket.id].score;
            playerList[socket.id] = data;
            playerList[socket.id].score = severScore
            if(playerCount > 1) {
                socket.broadcast.emit("update" , playerList[socket.id]);
            }
        }
    });

    socket.on("updateVroom",function(id,carID){
        if(logged) {
            VroomBuckList[id].move();
            playerList[carID].score += 1;
            socket.broadcast.emit("UpdateScore",carID,playerList[carID].score)
            socket.broadcast.emit("updateVroom",id,VroomBuckList[id].x,VroomBuckList[id].y)
        }
    });

    socket.on("removeScrap",function(id,carID){
        if(logged) {
            scrapBuckList.splice(id,1);
            playerList[carID].score += 3;
            socket.broadcast.emit("UpdateScore",carID,playerList[carID].score)
            socket.broadcast.emit("removeScrap",id);
        }
    });

    socket.on("sendMessage",function(message){
        if(logged) {
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
            else if (message.text === "!reset") {
                playerList[socket.id].x = 800;
                playerList[socket.id].y = 400;
                playerList[socket.id].speedX = 0,
                playerList[socket.id].speedY = 0,
                playerList[socket.id].angle = 0,
                playerList[socket.id].angleSpeed = 0,
                playerList[socket.id].score
                socket.emit("move" , playerList[socket.id]);
            }
            else if(message.text === "!speedBoost") {
                playerList[socket.id].score += 1000
                socket.emit("speed" , playerList[socket.id].score);
            }
            else {
                var newMessage = "" + socket.credentials[0] + ":" + message.text;
                socket.broadcast.emit("getMessage",newMessage);
            }
        }
    });

    socket.on("remove",function(score){
        playerList[socket.id].score -= score
        socket.broadcast.emit("UpdateScore",socket.id,playerList[socket.id].score)
    })

    socket.on("getScoreBoard",function(score){
        scoreBoard = playerList.slice();
        scoreBoard.sort(function(a, b){
            return b.score - a.score;
        });

    })

    socket.on("newScrap",function(x,y,amount){
        if(logged) {
            makeScrap(x,y,amount);
            socket.broadcast.emit("updateScrap",scrapBuckList);
        }
    });

    socket.on("disconnect" , function() {
        console.log("disconnected");
        if(logged) {
            socket.broadcast.emit("removePlayer" , playerList[socket.id]);
            var current = playerList[socket.id];
            //Log the user off
            getInfo("UPDATE Users SET vroomBuck = "+ current.score +", posX = "+ current.x +", posY = "+current.y+", logged = 0 WHERE userName  = '" + socket.credentials[0] + "' AND hashedPassword = " + socket.credentials[1], function(result){
                var stuffWanted = '';
                stuffWanted = result;
                delete socketList[socket.id];
                delete playerList[socket.id];
                socket.broadcast.emit("getMessage",socket.credentials[0] + " has disconnected...");
            });
        }
    });
});

server.listen(3000 , function() {
    console.log("listening on localhost:3000");
});