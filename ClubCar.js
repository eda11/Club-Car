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
    context.beginPath();
    context.rect(20, 20, 150, 100);
    context.stroke();
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
    
    drawCar(cornerCalcX(x+10,y+10),cornerCalcY(x+10,y+10),
            cornerCalcX(x-30,y+10),cornerCalcY(x-30,y+10),
            cornerCalcX(x-30,y-10),cornerCalcY(x-30,y-10),
            cornerCalcX(x+10,y-10),cornerCalcY(x+10,y-10));
            

    calculateSpeed();
}

function calculateSpeed(){

    //Increase the speed in the correct direction
    
    angleSpeed += angleMod*0.005;
    speedX += accelaration*Math.cos(angle)*mod; 
    speedY += accelaration*Math.sin(angle)*mod;

    //Decrease the speeds by the friction
    angleSpeed = Approach(angleSpeed,0,0.005*Math.abs(angleSpeed/0.06))
    speedX = Approach(speedX, 0, friction*Math.abs(speedX/maxSpeed));
    speedY = Approach(speedY, 0, friction*Math.abs(speedY/maxSpeed));
    //console.log("X :" + Math.abs(friction*Math.sin(angle)) + "    Y : " + Math.abs(friction*Math.sin(angle)))

    c1 = (offScreen(cornerCalcX(x + speedX +10,y + speedY +10,angle + angleSpeed),cornerCalcY(x + speedX +10,y + speedY +10,angle + angleSpeed)))
    c2 = (offScreen(cornerCalcX(x + speedX -30,y + speedY +10,angle + angleSpeed),cornerCalcY(x + speedX -30,y + speedY +10,angle + angleSpeed)))
    c3 = (offScreen(cornerCalcX(x + speedX -30,y + speedY -10,angle + angleSpeed),cornerCalcY(x + speedX -30,y + speedY -10,angle + angleSpeed)))
    c4 = (offScreen(cornerCalcX(x + speedX +10,y + speedY -10,angle + angleSpeed),cornerCalcY(x + speedX +10,y + speedY -10,angle + angleSpeed)))

    console.log(c1)

    //Prevents going off screen
    if (c1*c2*c3*c4) {x += speedX,y += speedY,angle += angleSpeed}
    else {speedX = -speedX*0.4; speedY = -speedY*0.4; angleSpeed = -angleSpeed*0.4 }

    c1 = (offScreen(cornerCalcX(x + speedX +10,y +10,angle + angleSpeed),cornerCalcY(x + speedX +10,y +10,angle)))
    c2 = (offScreen(cornerCalcX(x + speedX -30,y +10,angle + angleSpeed),cornerCalcY(x + speedX -30,y +10,angle)))
    c3 = (offScreen(cornerCalcX(x + speedX -30,y -10,angle + angleSpeed),cornerCalcY(x + speedX -30,y -10,angle)))
    c4 = (offScreen(cornerCalcX(x + speedX +10,y -10,angle + angleSpeed),cornerCalcY(x + speedX +10,y -10,angle)))

    if (!(c1*c2*c3*c4)){
        x = Approach(x, startx, 2);
        y = Approach(y, starty, 2);
        speedX = Approach(speedX, 0, friction);
        speedY = Approach(speedY, 0, friction);
    }


}

function drawCar(c1x,c1y,c2x,c2y,c3x,c3y,c4x,c4y) {
    context.beginPath();
    context.moveTo(c1x,c1y);
    context.lineTo(c2x,c2y);
    context.lineTo(c3x,c3y);
    context.lineTo(c4x,c4y);
    context.closePath();
    context.fill();
}

function offScreen(x,y){
    if   (((x+speedX < widthBackground-startx)*(x+speedX > -startx))*((y+speedY < heightBackground-starty)*(y+speedY > -starty))) {return true}
    else {return false}

}

function cornerCalcX(cornerX,cornerY,angle){
    return (Math.cos(angle)*(cornerX-x)) - (Math.sin(angle)*(cornerY-y)) + x;
}
function cornerCalcY(cornerX,cornerY,angle){
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


