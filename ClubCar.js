// TODO : Add comments

//The starting position for the car
startx = 800
starty = 400

//The width and height of the background
widthBackground = 2000
heightBackground = 2000

canvas = document.getElementById("gameSpace");
context = canvas.getContext("2d");
var img = new Image();
img.src = "Sprites/CarTest.png";
var background = new Image();
background.src = "Sprites/Background Test.png";

window.addEventListener("keydown", keypress_handler, false);
window.addEventListener("keyup", keyup_handler, false);

var ctx = canvas.getContext('2d');
ctx.fillStyle = '#f00';



class Car {
    constructor(x, y, angle, image) {
        //Initialise car at the x and y coordinates
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

        this.collide = false;

        this.collisionX = 0;
        this.collisionY = 0;
        this.collisionAngle = 0;

        this.updateCorners();

        this.otherCars = [];
    }

    updateCorners(){
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
        this.otherCars.push(car);
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

    checkCarCollison(){
        for (let i = 0; i < this.otherCars.length; i++){
            if (!(null == this.lineCrossesCar(this.c1x,this.c1y,this.c2x,this.c2y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c1x,this.c1y,this.c2x,this.c2y,this.otherCars[i]),this.otherCars[i],true);
                break;
            }
            if (!(null == this.lineCrossesCar(this.c2x,this.c2y,this.c3x,this.c3y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c2x,this.c2y,this.c3x,this.c3y,this.otherCars[i]),this.otherCars[i],true);
                break;
            }
            if (!(null == this.lineCrossesCar(this.c3x,this.c3y,this.c4x,this.c4y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c3x,this.c3y,this.c4x,this.c4y,this.otherCars[i]),this.otherCars[i],true);
                break;
            }
            if (!(null == this.lineCrossesCar(this.c4x,this.c4y,this.c1x,this.c1y,this.otherCars[i]))){
                this.carCollide(this.lineCrossesCar(this.c4x,this.c4y,this.c1x,this.c1y,this.otherCars[i]),this.otherCars[i],true);
                break;
            }
        }
    }

    //This needs to be commented
    carCollide(coor,car,first){
        var x = coor[0];
        var y = coor[1];

        if (first) {car.carCollide(coor,this,false)};

        this.collide = true;

        var dx = car.x - this.x;
        var dy = car.y - this.y;
        var vx = car.speedX - this.speedX;
        var vy = car.speedY - this.speedY;
        var dvdr = dx*vx + dy*vy;
        var dist = 20

        var mag = ((2*1*1*dvdr)/((1+1)*dist))*0.5;

        var fx = (mag * dx)/dist;
        var fy = (mag * dy)/dist;
        var force = (Math.sqrt((fx*fx)+(fy*fy)))*0.015
        
        this.collisionX = fx;
        this.collisionY = fy;

        var c1 = (Math.cos(-this.angle)*(x-this.x)) - (Math.sin(-this.angle)*(y-this.y+10)) > 0
        var c2 = (Math.sin(-this.angle)*(x-this.x)) + (Math.cos(-this.angle)*(y-this.y+10)) > 0

        if (c1 == c2)
        {this.collisionAngle = force*-1;}
        else {this.collisionAngle = force;}
    }

    carCollideCalc(){
        this.x -= 3*this.speedX;
        this.y -= 3*this.speedY;

        this.speedX += this.collisionX;
        this.speedY += this.collisionY;
        this.angleSpeed += this.collisionAngle;
    }
    checkObjectCollison(x1,y1,x2,y2,x3,y3,x4,y4){
        if (!(null == this.lineCrossesCar(x1,y1,x2,y2,this))){
            this.objectCollide(this.lineCrossesCar(x1,y1,x2,y2,this));
        }
        else if (!(null == this.lineCrossesCar(x2,y2,x3,y3,this))){
            this.objectCollide(this.lineCrossesCar(x2,y2,x3,y3,this));
        }
        else if (!(null == this.lineCrossesCar(x3,y3,x4,y4,this))){
            this.objectCollide(this.lineCrossesCar(x3,y3,x4,y4,this));
        }
        else if (!(null == this.lineCrossesCar(x4,y4,x1,y1,this))){
            this.objectCollide(this.lineCrossesCar(x4,y4,x1,y1,this));
        }

    }

    objectCollide(coor){
        var x = coor[0];
        var y = coor[1];

        this.x -= 3*this.speedX;
        this.y -= 3*this.speedY;
        this.angle -= 3*this.angleSpeed;

        this.speedX = -0.9*this.speedX;
        this.speedY = -0.9*this.speedY;

        var force = 4*0.015

        var c1 = (Math.cos(-this.angle)*(x-this.x)) - (Math.sin(-this.angle)*(y-this.y+10)) > 0
        var c2 = (Math.sin(-this.angle)*(x-this.x)) + (Math.cos(-this.angle)*(y-this.y+10)) > 0

        if (c1 == c2)
        {this.angleSpeed -= force;}
        else {this.angleSpeed += force;}

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

        if (this.collide){
            this.carCollideCalc()
            console.log("Collide")
            this.collide = false;
            
        }

        //Increase the speed in the correct direction
        this.angleSpeed += angleMod*0.005;
        this.speedX += this.accelaration*Math.cos(this.angle)*speedMod; 
        this.speedY += this.accelaration*Math.sin(this.angle)*speedMod;

        //Decrease the speeds by the friction
        this.angleSpeed = Approach(this.angleSpeed,0,0.005*Math.abs(this.angleSpeed/0.06))
        this.speedX = Approach(this.speedX, 0, this.friction*Math.abs(this.speedX/this.maxSpeed));
        this.speedY = Approach(this.speedY, 0, this.friction*Math.abs(this.speedY/this.maxSpeed));

        this.angle += this.angleSpeed;
        if (this.angle > 2*Math.PI){this.angle -= 2*Math.PI}
        if (this.angle < 0){this.angle += 2*Math.PI}
        this.x += (this.speedX);
        this.y += (this.speedY);

        this.checkObjectCollison(0,0,0,2000,2000,2000,2000,0)
        this.checkObjectCollison(200,200,200,500,500,500,500,200)

        this.updateCorners();
    }
}

//Set up test cars
var player = new Car(900,450,20,"Sprites/CarTest.png");
var otherCar = new Car(800,600,1,"Sprites/CarTest.png");
var hey = new Car(600,600,1,"Sprites/CarTest.png");
var there = new Car(600,800,1,"Sprites/CarTest.png");
var ocaml = new Car(700,700,1,"Sprites/CarTest.png");
var best = new Car(800,800,1,"Sprites/CarTest.png");

//This should be refactored
player.addCar(otherCar);
player.addCar(hey);
player.addCar(there);
player.addCar(ocaml);
player.addCar(best);

otherCar.addCar(player);
otherCar.addCar(hey);
otherCar.addCar(there);
otherCar.addCar(ocaml);
otherCar.addCar(best);

hey.addCar(player);
hey.addCar(otherCar);
hey.addCar(there);
hey.addCar(ocaml);
hey.addCar(best);

there.addCar(player);
there.addCar(otherCar);
there.addCar(hey);
there.addCar(ocaml);
there.addCar(best);

ocaml.addCar(player);
ocaml.addCar(otherCar);
ocaml.addCar(hey);
ocaml.addCar(there);
ocaml.addCar(best);

best.addCar(player);
best.addCar(otherCar);
best.addCar(hey);
best.addCar(there);
best.addCar(ocaml);

var moveInterval = setInterval(function () {
    draw();
}, 15);

function on() {
  document.getElementById("overlay").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
}

function draw() {
    context = canvas.getContext("2d");
    context.clearRect(0, 0, 1800, 900);   

    player.drawOther(background,0,0,0,0,0,context);

    context.save();
    context.translate(-(player.x-900), -(player.y-450));
    context.rotate(0);
    context.fillRect(200,200,300,300); 
    context.restore();

    //This has to be re-factored
    player.drawCar(otherCar,context);
    player.drawCar(hey,context);
    player.drawCar(there,context);
    player.drawCar(ocaml,context);
    player.drawCar(best,context);
    player.drawSelf(context);

    player.checkCarCollison();
    otherCar.checkCarCollison();
    hey.checkCarCollison();
    there.checkCarCollison();
    ocaml.checkCarCollison();
    best.checkCarCollison();

    player.calculateSpeed(mod,angleMod);
    otherCar.calculateSpeed(0,0);
    hey.calculateSpeed(0,0);
    there.calculateSpeed(0,0);
    ocaml.calculateSpeed(0,0);
    best.calculateSpeed(0,0);
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

//Checks if 2 bounding boxes intersect
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
