//The starting position for the car
startx = 800
starty = 400

widthBackground = 2000
heightBackground = 2000


x = startx;
y = starty;
accelaration = 0.4;
maxSpeed = 6;
speedX = 0;
speedY = 0;
friction = 0.2;
angle = 0;
angleSpeed = 0;
mod = 0;
angleMod = 0;
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
        this.startx = x;
        this.starty = y;

        this.x = x;
        this.y = y;
        
        this.friction = 0.2;
        this.accelaration = 0.4;
        this.maxSpeed = 6;

        this.speedX = 0;
        this.speedY = 0;
        this.angleSpeed = 0;

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

        this.updateCorners();

        this.otherCars = [];
    }

    updateCorners(){
        this.c1x = Math.round((Math.cos(this.angle)*(10)) - (Math.sin(this.angle)*(10)) + this.x);
        this.c1y = Math.round((Math.sin(this.angle)*(10)) + (Math.cos(this.angle)*(10)) + this.y);

        this.c2x = Math.round((Math.cos(this.angle)*(-30)) - (Math.sin(this.angle)*(10)) + this.x);
        this.c2y = Math.round((Math.sin(this.angle)*(-30)) + (Math.cos(this.angle)*(10)) + this.y);

        this.c3x = Math.round((Math.cos(this.angle)*(-30)) - (Math.sin(this.angle)*(-10)) + this.x);
        this.c3y = Math.round((Math.sin(this.angle)*(-30)) + (Math.cos(this.angle)*(-10)) + this.y);

        this.c4x = Math.round((Math.cos(this.angle)*(10)) - (Math.sin(this.angle)*(-10)) + this.x);
        this.c4y = Math.round((Math.sin(this.angle)*(10)) + (Math.cos(this.angle)*(-10)) + this.y);
    }

    addCar(car){
        this.otherCars.push(car);
    }

    lineCrossesCar(x1,y1,x2,y2,car){
        if (!(null == intersect(x1,y1,x2,y2,car.c1x,car.c1y,car.c2x,car.c2y))){
            return intersect(x1,y1,x2,y2,car.c1x,car.c1y,car.c2x,car.c2y);
        }
        if (!(null == intersect(x1,y1,x2,y2,car.c2x,car.c2y,car.c3x,car.c3y))){
            return intersect(x1,y1,x2,y2,car.c2x,car.c2y,car.c3x,car.c3y);
        }
        if (!(null == intersect(x1,y1,x2,y2,car.c3x,car.c3y,car.c4x,car.c4y))){
            return intersect(x1,y1,x2,y2,car.c3x,car.c3y,car.c4x,car.c4y);
        }
        if (!(null == intersect(x1,y1,x2,y2,car.c4x,car.c4y,car.c1x,car.c1y))){
            return intersect(x1,y1,x2,y2,car.c3x,car.c3y,car.c4x,car.c4y);
        }
        return null;
    }

    checkCarCollison(){
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
        x = coor[0];
        y = coor[1];
        //colAng = Math.atan(y/x)
        //applyX = speedX*Math.sin(colAng)
        //applyY = speedY*Math.cos(colAng)


        var tspeedx = this.speedX
        var tspeedy = this.speedY
        
        this.speedX += 0.5*car.speedX - 0.6*tspeedx
        this.speedY += 0.5*car.speedY - 0.6*tspeedy

        car.speedX += 0.6*tspeedx - 0.5*car.speedX
        car.speedY += 0.6*tspeedy - 0.5*car.speedY
    }

    test(){
        console.log(this.checkCarCollison());
    }

    drawSelf(context) {
        context.save();
        context.translate(800, 400);
        context.rotate(this.angle);
        context.drawImage(this.img, 10-(this.img.width), 10-(this.img.height));
        context.restore();
    }

    drawCar(car,context){
        context.save();
        context.translate(car.x-(this.x-800), car.y-(this.y-400));
        context.rotate(car.angle);
        context.drawImage(car.img, 10-(car.img.width), 10-(car.img.height));
        context.restore();
    }

    drawOther(image,imageAngle,imageX,imageY,offSetX,offSetY,context){
        context.save();
        context.translate(imageX-(this.x-800), imageY-(this.y-400));
        context.rotate(imageAngle);
        context.drawImage(image,offSetX,offSetY);
        context.restore();
    }

    calculateSpeed(speedMod,angleMod){
        //Increase the speed in the correct direction
        this.angleSpeed += angleMod*0.005;
        this.speedX += this.accelaration*Math.cos(this.angle)*speedMod; 
        this.speedY += this.accelaration*Math.sin(this.angle)*speedMod;

        //Decrease the speeds by the friction
        this.angleSpeed = Approach(this.angleSpeed,0,0.005*Math.abs(this.angleSpeed/0.06))
        this.speedX = Approach(this.speedX, 0, this.friction*Math.abs(this.speedX/this.maxSpeed));
        this.speedY = Approach(this.speedY, 0, this.friction*Math.abs(this.speedY/this.maxSpeed));

        this.angle += this.angleSpeed;
        this.x += this.speedX;
        this.y += this.speedY;

        this.updateCorners();
    }
}

var player = new Car(800,800,20,"Sprites/CarTest.png");
var otherCar = new Car(800,600,20,"Sprites/CarTest.png");
player.addCar(otherCar);
otherCar.addCar(player);

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
    context.clearRect(0, 0, 1600, 1600);

    //player.test();
    player.test();
    

    angle += 0.01

    player.drawOther(background,0,0,0,0,0,context);
    player.drawCar(otherCar,context);
    player.drawSelf(context);

    player.calculateSpeed(mod,angleMod);
    otherCar.calculateSpeed(0,0);

    player.checkCarCollison();
}

function keyup_handler(event) {
    if (event.keyCode == 87 || event.keyCode == 83) {
        mod = 0;
    }
    if (event.keyCode == 65 || event.keyCode == 68) {
        angleMod = 0;
    } 
}

function keypress_handler(event) {
    if (event.keyCode == 87) {
        mod = 1;
    }
    if (event.keyCode == 83) {
        mod = -0.6;
    }
    if (event.keyCode == 65) {
        angleMod = -1;
    }
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