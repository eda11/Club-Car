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

    //Draw the background
    context.save();
    context.translate(-x, -y);
    context.drawImage(background,0,0);
    context.restore();

    //Draw another car
    context.save();
    context.translate(-x + 800, -y + 800);
    context.rotate(angle);
    context.drawImage(img, 10-(img.width), 10-(img.height));
    context.restore(); 

    //context.fillStyle = "rgb(200, 100, 220)";

    //Draw the player
    context.save();
    context.translate(800, 400);
    context.rotate(angle);
    context.drawImage(img, 10-(img.width), 10-(img.height));
    context.restore();
    /*
    drawCar(cornerCalcX(x+10,y+10),cornerCalcY(x+10,y+10),
            cornerCalcX(x-30,y+10),cornerCalcY(x-30,y+10),
            cornerCalcX(x-30,y-10),cornerCalcY(x-30,y-10),
            cornerCalcX(x+10,y-10),cornerCalcY(x+10,y-10));
            */

    calculateSpeed();
}

function calculateSpeed(){

    angle += angleMod*0.03

    //Increase the speed in the correct direction

    speedX += accelaration*Math.cos(angle)*mod; 
    speedY += accelaration*Math.sin(angle)*mod;

    //Decrease the speeds by the friction
    speedX = Approach(speedX, 0, friction*Math.abs(speedX/maxSpeed));
    speedY = Approach(speedY, 0, friction*Math.abs(speedY/maxSpeed));
    //console.log("X :" + Math.abs(friction*Math.sin(angle)) + "    Y : " + Math.abs(friction*Math.sin(angle)))
    

    //Prevents going off screen
    if ((x+speedX < widthBackground-startx)*(x+speedX > -startx)) {x += speedX}
    else {speedX = -speedX*0.4; speedY = -speedY*0.4}
    if ((y+speedY < heightBackground-starty)*(y+speedY > -starty)) {y += speedY}
    else {speedX = -speedX*0.4; speedY = -speedY*0.4}


}

function drawCar(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y) {
    ctx.beginPath();
    ctx.moveTo(c1x,c1y);
    ctx.lineTo(c2x,c2y);
    ctx.lineTo(c3x,c3y);
    ctx.lineTo(c4x,c4y);
    ctx.closePath();
    ctx.fill();
}

function cornerCalcX(cornerX,cornerY){
    return (Math.cos(angle)*(cornerX-x)) - (Math.sin(angle)*(cornerY-y)) + x;
}
function cornerCalcY(cornerX,cornerY){
    return (Math.sin(angle)*(cornerX-x)) + (Math.cos(angle)*(cornerY-y)) + y;
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
    console.log(event.keyCode);
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


