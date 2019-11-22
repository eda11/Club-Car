// TODO : Add comments

//Gets canvas from html
canvas = document.getElementById("gameSpace");
var ctx = canvas.getContext('2d');
ctx.fillStyle = '#f00';

//Set up images
var img = new Image();
img.src = "Sprites/CarTest.png";

var vroomBuckImage = new Image();
vroomBuckImage.src = "Sprites/VroomBuck.png"

var background = new Image();
background.src = "Sprites/Background.png";

//Adds keylistners
window.addEventListener("keydown", keypress_handler, false);
window.addEventListener("keyup", keyup_handler, false);

// connect the socket to the server and emit a test
var socket = io.connect();

//The width and height of the background
widthBackground = 4000
heightBackground = 4000

//Sets up varibles
var playerID = -1;
var cars = [];
var chatLog = [];
var scoreBoard = [];
var VroomBuckList = [];

var message = "";

var typing = false;

mod = 0;
angleMod = 0;

class Car {
    constructor(id , score,  x, y, angle, image) {
        //Initialise car at the x and y coordinates
        this.id = id;
        this.score = score;

        this.startx = x;
        this.starty = y;

        this.x = x;
        this.y = y;
        
        //Initalise the movement vars
        this.friction = 0.3;
        this.accelaration = 0.4;
        this.maxSpeed = 6;

        //This contains the movement speeds
        this.speedX = 0;
        this.speedY = 0;
        this.angleSpeed = 0;

        this.tempSpeedX = 0;
        this.tempSpeedY = 0;

        //This contains the angle and image of the car
        this.angle = angle;
        this.img = new Image();
        this.img.src = image;
        
        this.c1x = 0;
        this.c1y = 0;

        this.c2x = 0;
        this.c2y = 0;

        this.c3x = 0;
        this.c3y = 0;

        this.c4x = 0;
        this.c4y = 0;

        this.collisionDelay = 0;

        this.collide = false;

        this.collisionX = 0;
        this.collisionY = 0;
        this.collisionAngle = 0;

        this.updateCorners();

        this.otherCars = [];
    }

    updateCorners(){
        //Calculates positions of the corners of the car
        this.c1x = (Math.cos(this.angle)*(10)) - (Math.sin(this.angle)*(10)) + this.x;
        this.c1y = (Math.sin(this.angle)*(10)) + (Math.cos(this.angle)*(10)) + this.y;

        this.c2x = (Math.cos(this.angle)*(-30)) - (Math.sin(this.angle)*(10)) + this.x;
        this.c2y = (Math.sin(this.angle)*(-30)) + (Math.cos(this.angle)*(10)) + this.y;

        this.c3x = (Math.cos(this.angle)*(-30)) - (Math.sin(this.angle)*(-10)) + this.x;
        this.c3y = (Math.sin(this.angle)*(-30)) + (Math.cos(this.angle)*(-10)) + this.y;

        this.c4x = (Math.cos(this.angle)*(10)) - (Math.sin(this.angle)*(-10)) + this.x;
        this.c4y = (Math.sin(this.angle)*(10)) + (Math.cos(this.angle)*(-10)) + this.y;
    }

    addCar(car){
        if (car.id != this.id)
            this.otherCars.push(car);
    }

    removeCar(car){
        delete this.otherCars[car];
    }

    lineCrossesCar(x1,y1,x2,y2,car){
        if (!(null == intersect(x1,y1,x2,y2,car.c1x,car.c1y,car.c2x,car.c2y))){
            return intersect(x1,y1,x2,y2,car.c1x,car.c1y,car.c2x,car.c2y);
        }
        else if (!(null == intersect(x1,y1,x2,y2,car.c2x,car.c2y,car.c3x,car.c3y))){
            return intersect(x1,y1,x2,y2,car.c2x,car.c2y,car.c3x,car.c3y);
        }
        else if (!(null == intersect(x1,y1,x2,y2,car.c3x,car.c3y,car.c4x,car.c4y))){
            return intersect(x1,y1,x2,y2,car.c3x,car.c3y,car.c4x,car.c4y);
        }
        else if (!(null == intersect(x1,y1,x2,y2,car.c4x,car.c4y,car.c1x,car.c1y))){
            return intersect(x1,y1,x2,y2,car.c3x,car.c3y,car.c4x,car.c4y);
        }
        return null;
    }

    checkCarCollision(){
        //Goes though each car and checks if they collide with this car
        //If they do then carCollide is called
        for (let i = 0; i < this.otherCars.length; i++){
            if (!(null == this.lineCrossesCar(this.c1x,this.c1y,this.c2x,this.c2y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c1x,this.c1y,this.c2x,this.c2y,this.otherCars[i]),this.otherCars[i]);
                break;
            }
            if (!(null == this.lineCrossesCar(this.c2x,this.c2y,this.c3x,this.c3y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c2x,this.c2y,this.c3x,this.c3y,this.otherCars[i]),this.otherCars[i]);
                break;
            }
            if (!(null == this.lineCrossesCar(this.c3x,this.c3y,this.c4x,this.c4y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c3x,this.c3y,this.c4x,this.c4y,this.otherCars[i]),this.otherCars[i]);
                break;
            }
            if (!(null == this.lineCrossesCar(this.c4x,this.c4y,this.c1x,this.c1y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c4x,this.c4y,this.c1x,this.c1y,this.otherCars[i]),this.otherCars[i]);
                break;
            }
        }
    }

    
    carCollide(coor,car){
        //gets coordinates
        var x = coor[0];
        var y = coor[1];

        var thisSpeed = (this.speedX*this.speedX) + (this.speedY*this.speedY)
        var carSpeed = (car.speedX*car.speedX) + (car.speedY*car.speedY)

        //Calculates the forces of the collision
        var fx = (-0.5 * (car.x - this.x));
        var fy = (-0.5 * (car.y - this.y));

        //Applies forces to the car
        car.collisionX = -fx;
        car.collisionY = -fy;
        car.collide = true;
        this.collisionX = fx;
        this.collisionY = fy;
        this.collide = true;

        //Calculates where the car hit
        var c1 = (Math.cos(-this.angle)*(x-this.x)) - (Math.sin(-this.angle)*(y-this.y+10)) > 0
        var c2 = (Math.sin(-this.angle)*(x-this.x)) + (Math.cos(-this.angle)*(y-this.y+10)) > 0

        //Applies angler force based off where carc was hit
        if (c1 == c2)
        {this.collisionAngle = -0.3;}
        else {this.collisionAngle = 0.3;}
    }

    carCollideCalc(){
        if(this.collisionDelay == 0){
            //Sets a delay for a collision
            this.collisionDelay = 5;

            //Moves car back from collision
            this.x -= 3*this.speedX;
            this.y -= 3*this.speedY;

            //Applies changes to speed
            this.speedX += this.collisionX;
            this.speedY += this.collisionY;
            this.angleSpeed += this.collisionAngle;
        }
    }
    checkObjectCollison(x1,y1,x2,y2,x3,y3,x4,y4){
        //Checks if any of the car sides is colliding with an object
        //If it is it calls the object collide function
        if (!(null == this.lineCrossesCar(x1,y1,x2,y2,this))){
            return true;
        }
        else if (!(null == this.lineCrossesCar(x2,y2,x3,y3,this))){
            return true;
        }
        else if (!(null == this.lineCrossesCar(x3,y3,x4,y4,this))){
            return true;
        }
        else if (!(null == this.lineCrossesCar(x4,y4,x1,y1,this))){
            return true;
        }

    }

    objectCollide(){

        //Pushes car from objects
        this.x -= 3*this.speedX;
        this.y -= 3*this.speedY;
        this.angle -= 2*this.angleSpeed;

        //Reverses speed
        this.speedX = -this.speedX;
        this.speedY = -this.speedY;

    }

    drawSelf(context) {
        context.save();
        context.translate(900, 450);
        context.rotate(this.angle);
        context.drawImage(this.img, 10-(this.img.width), 10-(this.img.height));
        context.restore();
    }

    drawCar(car,context){
        context.save();
        context.translate(car.x-(this.x-900), car.y-(this.y-450));
        context.rotate(car.angle);
        context.drawImage(car.img, 10-(car.img.width), 10-(car.img.height));
        context.restore();
    }

    drawOther(image,imageAngle,imageX,imageY,offSetX,offSetY,context){
        context.save();
        context.translate(imageX-(this.x-900), imageY-(this.y-450));
        context.rotate(imageAngle);
        context.drawImage(image,offSetX,offSetY);
        context.restore();
    }

    calculateSpeed(speedMod,angleMod){

        //Handles collisions with other cars
        if(this.collisionDelay > 0) this.collisionDelay--;
        if (this.collide){
            this.carCollideCalc()
            this.collide = false;
        }

        //Update Maxspeed
        this.maxSpeed = 6 + 0.02*this.score;

        //Increase the speed in the correct direction
        this.angleSpeed += angleMod*0.005;
        this.speedX += this.accelaration*Math.cos(this.angle)*speedMod; 
        this.speedY += this.accelaration*Math.sin(this.angle)*speedMod;

        //Decrease the speeds by the friction
        this.angleSpeed = Approach(this.angleSpeed,0,0.005*Math.abs(this.angleSpeed/0.06))
        this.speedX = Approach(this.speedX, 0, this.friction*Math.abs(this.speedX/this.maxSpeed));
        this.speedY = Approach(this.speedY, 0, this.friction*Math.abs(this.speedY/this.maxSpeed));

        //Applies speed to car postion
        this.x += (this.speedX);
        this.y += (this.speedY);
        this.angle += this.angleSpeed;

        //Makes sure angle is between 0 and 2PI
        if (this.angle > 2*Math.PI){this.angle -= 2*Math.PI}
        if (this.angle < 0){this.angle += 2*Math.PI}

        //Checks if the car has collided with an object
        if(this.checkObjectCollison(0,0,0,4000,4000,4000,4000,0)) this.objectCollide();

        this.updateCorners();
    }
}

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
        socket.emit("updateVroom",this.id,this.x,this.y);
    }
}

var moveInterval = setInterval(function () {
    draw();
    cars[playerID].checkCarCollision();
    updateSpeed();
    update();
}, 15);


//Draw to the canvas
function draw() {
    context = canvas.getContext("2d");

    //Clears game
    context.clearRect(0, 0, 1800, 900);   

    //Draws background
    cars[playerID].drawOther(background,0,0,0,0,0,context);
    for(i in VroomBuckList){
        VroomBuckList[i].draw(cars[playerID], context);
        VroomBuckList[i].checkPickUp(cars[playerID]);
    }

    //Draws cars
    for(i in cars) {
        cars[playerID].drawCar(cars[i] , context);
    }
    cars[playerID].drawSelf(context);

    //Draws chat
    drawChat(context);
    
    //Draws scoreBoard
    drawScoreBoard(context);
}

//Draws the chat
function drawChat(){
    context.font = "Bold 25px Courier New";
    context.fillStyle = "#000000";
    var arrayAccess;
    var i;
    //Draws the 5 most recent messages on the canvas
    for (var i = 1; i < 6; i++) {
        arrayAccess = chatLog.length - i;
        if (arrayAccess < 0){break;}
        context.fillText(""+chatLog[arrayAccess], 0, 875 - (i*25));
    }
    //Draws the current message
    if (typing) {context.fillText(message + "_", 0, 875);}
    else {context.fillText(message, 0, 875);}
    
}


//Draws the top 5 players, and the current player's score
function drawScoreBoard(){
    context.font = "Bold 25px Courier New";
    context.fillStyle = "#000000";
    context.fillText("" + cars[playerID].score, 0, 25);
}

function updateSpeed(){
    for(i in cars) {
        if(i == playerID) {
            cars[playerID].calculateSpeed(mod , angleMod);
        } else {
            cars[i].calculateSpeed(0 , 0);
        }
    }
}

//Sends position data to the server
function update() {
    var update = {
        playerID: playerID,
        score: cars[playerID].score,
        x: cars[playerID].x,
        y: cars[playerID].y,
        speedX: cars[playerID].speedX,
        speedY: cars[playerID].speedY,
        angle: cars[playerID].angle,
        angleSpeed: cars[playerID].angleSpeed,
    }
    socket.emit("update" , update);
}

// we iterate through a list of given players
socket.on("initialize" , function(id , data, vrooms) {
    playerID = id;
    for(i in vrooms) VroomBuckList[i] = new VroomBuck(vrooms[i].id,vrooms[i].x,vrooms[i].y);
    console.log(VroomBuckList);
    // create the cars
    for(i in data) {
        cars[data[i].playerID] = new Car(data[i].playerID , data[i].score , data[i].x , data[i].y , data[i].angle , "Sprites/CarTest.png");
    }
    // add cars to each other
    for(i in cars) {
        for(j in cars) {
            if(i != j) {
                cars[i].addCar(cars[j]);
            }
        }
    }
});

socket.on("addPlayer" , function(data) {
    var newCar = new Car(data.playerID , data.score , data.x , data.y , data.angle , "Sprites/CarTest.png");
    for(i in cars) {
        cars[i].addCar(newCar);
        newCar.addCar(cars[i]);
    }
    cars[data.playerID] = newCar;
});

socket.on("removePlayer" , function(data) {
    for(i in cars) {
        cars[i].removeCar(cars[data.playerID]);
    }
    delete cars[data.playerID];
});

socket.on("update" , function(data) {
    cars[data.playerID].score = data.score;
    cars[data.playerID].x = data.x;
    cars[data.playerID].y = data.y;
    cars[data.playerID].speedX = data.speedX;
    cars[data.playerID].speedY = data.speedY;
    cars[data.playerID].angle = data.angle;
    cars[data.playerID].angleSpeed = data.angleSpeed;
});

socket.on("move" , function(data) {
    cars[playerID].x = data.x;
    cars[playerID].y = data.y;
    cars[playerID].speedX = data.speedX;
    cars[playerID].speedY = data.speedY;
    cars[playerID].angle = data.angle;
    cars[playerID].angleSpeed = data.angleSpeed;
});

socket.on("getMessage", function(data) {
    chatLog.push(data);
});

socket.on("speed" , function(data) {
    cars[playerID].score = data
});

socket.on("updateVroom",function(id,x,y){
    VroomBuckList[id].update(x,y);
});

function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

function keyup_handler(event) {
    //W or S (forwards or reverse)
    if (event.keyCode == 87 || event.keyCode == 83) {
        mod = 0;
    }
    //A or D (turn left or right)
    if (event.keyCode == 65 || event.keyCode == 68) {
        angleMod = 0;
    } 
}

function keypress_handler(event) {

    if (!typing) {
            //W (Forwards)
        if (event.keyCode == 87) {
            mod = 1;
        }
        //S (Reverse)
        if (event.keyCode == 83) {
            mod = -0.6;
        }
        //A (Turn left)
        if (event.keyCode == 65) {
            angleMod = -1;
        }
        //D (Turn right)
        if (event.keyCode == 68) {
            angleMod = 1;
        }

        //Enter (start message)
        if (event.keyCode == 13){
            typing = true;
        }
    }
    else {
        //Begin typing
        if (event.keyCode == 13){
            typing = false;
            if (message.length != 0) {
                //Send the message
                var sendMessage = {
                    text: message 
                }
                socket.emit("sendMessage",sendMessage);
                message = "";
            }
        }
        //Backspace
        else if (event.keyCode == 8){
            if (message.length != 0) {
                var tempString = message.substring(0,message.length-1);
                message = tempString;
            }
        }
        else {
            //Add to the message
            if ((event.key).length == 1 && message.length < 60) {
                message += event.key;
            }
        }
    }
}

//Takes a value and moves it towards the desired ammount
//while not wrapping over. Works both with negative and positive
function Approach(currentValue, desiredValue, ammount ) {
    if (currentValue < desiredValue) {
        currentValue += ammount;
        if (currentValue > desiredValue) {
            return desiredValue;
        }
    }
    else {
        currentValue -= ammount
        if (currentValue < desiredValue){
            return desiredValue;
        }
    }
    return currentValue
}

//Checks if 2 lines intersect
function intersect(x1,y1,x2,y2,x3,y3,x4,y4){
    s1x = x2 - x1;
    s1y = y2 - y1;

    s2x = x4 - x3;
    s2y = y4 - y3;

    s1 = ((-s1y * (x1 - x3)) + (s1x * (y1 - y3))) / ((-s2x * s1y) + (s1x * s2y))
    s2 = (( s2x * (y1 - y3)) - (s2y * (x1 - x3))) / ((-s2x * s1y) + (s1x * s2y))

    if ((s1 >= 0)*(s1 <= 1)*(s2 >= 0)*(s2 <= 1))
    {
        return [(x1 + (s2*s1x)),(y1 + (s2*s1y))];
    }
    else 
    {
        return null;;
    }
}